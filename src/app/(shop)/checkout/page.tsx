'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { MapPin, CreditCard, Banknote, Plus, CheckCircle2, Pencil, QrCode, UploadCloud, Loader2 } from 'lucide-react';
import { api, ApiEnvelope, extractApiError } from '@/lib/api';
import { Address, Order } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';
import { AddressForm, AddressFormValues } from '@/components/account/AddressForm';
import { formatCurrency, cn } from '@/lib/utils';
import { loadRazorpayScript } from '@/lib/razorpay';

export default function CheckoutPage() {
  const { user, loading: authLoading } = useAuth();
  const { cart, isLoading: cartLoading } = useCart();
  const { showToast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod' | 'qr_manual'>('qr_manual');
  const [placing, setPlacing] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);
  const screenshotInputRef = useRef<HTMLInputElement>(null);

  const { data: publicSettings } = useQuery({
    queryKey: ['settings-public'],
    queryFn: async () =>
      (
        await api.get<ApiEnvelope<{ payment: { qrPaymentEnabled: boolean; qrCodeImage?: string; upiId?: string } }>>('/settings/public')
      ).data.data,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login?redirect=/checkout');
  }, [authLoading, user, router]);

  const { data: addresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: async () => (await api.get<ApiEnvelope<Address[]>>('/addresses')).data.data,
    enabled: !!user,
  });

  useEffect(() => {
    if (addresses && addresses.length > 0 && !selectedAddressId) {
      const def = addresses.find((a) => a.isDefault) || addresses[0];
      setSelectedAddressId(def._id);
    }
  }, [addresses, selectedAddressId]);

  const createAddressMutation = useMutation({
    mutationFn: async (values: AddressFormValues) => (await api.post<ApiEnvelope<Address>>('/addresses', values)).data.data,
    onSuccess: (address) => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      setSelectedAddressId(address._id);
      setShowAddressForm(false);
      showToast('Address saved', 'success');
    },
    onError: (err) => showToast(extractApiError(err), 'error'),
  });

  const updateAddressMutation = useMutation({
    mutationFn: async (values: AddressFormValues) =>
      (await api.patch<ApiEnvelope<Address>>(`/addresses/${editingAddress?._id}`, values)).data.data,
    onSuccess: (address) => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      setSelectedAddressId(address._id);
      setEditingAddress(null);
      setShowAddressForm(false);
      showToast('Address updated', 'success');
    },
    onError: (err) => showToast(extractApiError(err), 'error'),
  });

  const activeLines = (cart?.lines || []).filter((l) => !l.savedForLater);
  const codBlocked = activeLines.some((l) => !l.codAvailable);

  const handleScreenshotUpload = async (file: File) => {
    setUploadingScreenshot(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.post<ApiEnvelope<{ url: string }>>('/uploads/payment-screenshot', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setScreenshotUrl(res.data.data.url);
      showToast('Screenshot attached', 'success');
    } catch (err) {
      showToast(extractApiError(err), 'error');
    } finally {
      setUploadingScreenshot(false);
    }
  };

  const placeOrder = async () => {
    if (!selectedAddressId) return showToast('Please select a delivery address', 'error');
    if (paymentMethod === 'qr_manual' && !screenshotUrl) {
      return showToast('Please pay via the QR code and upload your payment screenshot first', 'error');
    }
    setPlacing(true);
    try {
      const res = await api.post<
        ApiEnvelope<{ order: Order; paymentMethod: string; razorpayKeyId?: string; razorpayOrder?: { orderId: string; amount: number; currency: string } }>
      >('/checkout/initiate', {
        addressId: selectedAddressId,
        paymentMethod,
        screenshotUrl: paymentMethod === 'qr_manual' ? screenshotUrl : undefined,
      });

      const result = res.data.data;

      if (result.paymentMethod === 'cod' || result.paymentMethod === 'qr_manual') {
        showToast('Order placed successfully!', 'success');
        queryClient.invalidateQueries({ queryKey: ['cart'] });
        router.push(`/order-confirmation/${result.order._id}`);
        return;
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !result.razorpayOrder) {
        showToast('Unable to load payment gateway. Please try again.', 'error');
        setPlacing(false);
        return;
      }

      const razorpay = new window.Razorpay({
        key: result.razorpayKeyId!,
        amount: result.razorpayOrder.amount,
        currency: result.razorpayOrder.currency,
        name: 'TrackingZoom GPS',
        description: `Order ${result.order.orderNumber}`,
        order_id: result.razorpayOrder.orderId,
        prefill: { name: user?.name, contact: user?.mobile, email: user?.email },
        theme: { color: '#0082c9' },
        handler: async (response) => {
          try {
            await api.post('/payments/verify', { orderId: result.order._id, ...response });
            queryClient.invalidateQueries({ queryKey: ['cart'] });
            router.push(`/order-confirmation/${result.order._id}`);
          } catch (err) {
            showToast(extractApiError(err), 'error');
            setPlacing(false);
          }
        },
        modal: {
          ondismiss: () => setPlacing(false),
        },
      });
      razorpay.open();
    } catch (err) {
      showToast(extractApiError(err), 'error');
      setPlacing(false);
    }
  };

  if (authLoading || cartLoading || !user) {
    return <div className="container-page py-16 text-center text-gray-400">Loading checkout...</div>;
  }

  if (activeLines.length === 0) {
    return (
      <div className="container-page py-16 text-center">
        <p className="text-gray-500">Your cart is empty.</p>
        <Button className="mt-4" onClick={() => router.push('/products')}>Browse Products</Button>
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Checkout</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <section className="rounded-xl border border-gray-100 p-5 shadow-card">
            <h2 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
              <MapPin className="h-5 w-5 text-brand-600" /> Delivery Address
            </h2>

            {addresses && addresses.length > 0 && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {addresses.map((addr) => (
                  <motion.button
                    key={addr._id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedAddressId(addr._id)}
                    className={cn(
                      'rounded-lg border p-3 text-left text-sm',
                      selectedAddressId === addr._id ? 'border-brand-500 bg-brand-50' : 'border-gray-200'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium capitalize text-gray-800">{addr.label}</span>
                      <span className="flex items-center gap-2">
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(event) => {
                            event.stopPropagation();
                            setEditingAddress(addr);
                            setShowAddressForm(true);
                          }}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault();
                              event.stopPropagation();
                              setEditingAddress(addr);
                              setShowAddressForm(true);
                            }
                          }}
                          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-brand-600"
                          aria-label={`Edit ${addr.label} address`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </span>
                        {selectedAddressId === addr._id && <CheckCircle2 className="h-4 w-4 text-brand-600" />}
                      </span>
                    </div>
                    <p className="mt-1 text-gray-600">{addr.name}, {addr.mobile}</p>
                    <p className="text-gray-500">
                      {addr.addressLine1}, {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                  </motion.button>
                ))}
              </div>
            )}

            {!showAddressForm ? (
              <button
                onClick={() => {
                  setEditingAddress(null);
                  setShowAddressForm(true);
                }}
                className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-brand-600"
              >
                <Plus className="h-4 w-4" /> Add New Address
              </button>
            ) : (
              <div className="mt-4 border-t border-gray-100 pt-4">
                <AddressForm
                  initial={editingAddress || undefined}
                  loading={createAddressMutation.isPending || updateAddressMutation.isPending}
                  onSubmit={(values) => {
                    if (editingAddress) updateAddressMutation.mutate(values);
                    else createAddressMutation.mutate(values);
                  }}
                  onCancel={() => {
                    setShowAddressForm(false);
                    setEditingAddress(null);
                  }}
                />
              </div>
            )}
          </section>

          <section className="rounded-xl border border-gray-100 p-5 shadow-card">
            <h2 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
              <CreditCard className="h-5 w-5 text-brand-600" /> Payment Method
            </h2>
            <div className="space-y-2">
              {/* Razorpay option disabled until a live gateway is connected — code kept intact, just not offered.
                  Flip this back to render (and set the default paymentMethod back to 'online') once RAZORPAY_KEY_ID is configured. */}
              {false && (
                <button
                  onClick={() => setPaymentMethod('online')}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg border p-3 text-left text-sm',
                    paymentMethod === 'online' ? 'border-brand-500 bg-brand-50' : 'border-gray-200'
                  )}
                >
                  <CreditCard className="h-5 w-5 text-brand-600" />
                  <div>
                    <p className="font-medium text-gray-800">Pay Online</p>
                    <p className="text-xs text-gray-500">UPI, Cards, Netbanking &amp; Wallets via Razorpay</p>
                  </div>
                </button>
              )}
              {publicSettings?.payment?.qrPaymentEnabled && (
                <button
                  onClick={() => setPaymentMethod('qr_manual')}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg border p-3 text-left text-sm',
                    paymentMethod === 'qr_manual' ? 'border-brand-500 bg-brand-50' : 'border-gray-200'
                  )}
                >
                  <QrCode className="h-5 w-5 text-brand-600" />
                  <div>
                    <p className="font-medium text-gray-800">Pay via UPI QR Code</p>
                    <p className="text-xs text-gray-500">Scan &amp; pay, then upload your payment screenshot</p>
                  </div>
                </button>
              )}
              <button
                onClick={() => !codBlocked && setPaymentMethod('cod')}
                disabled={codBlocked}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg border p-3 text-left text-sm disabled:cursor-not-allowed disabled:opacity-50',
                  paymentMethod === 'cod' ? 'border-brand-500 bg-brand-50' : 'border-gray-200'
                )}
              >
                <Banknote className="h-5 w-5 text-brand-600" />
                <div>
                  <p className="font-medium text-gray-800">Cash on Delivery</p>
                  <p className="text-xs text-gray-500">
                    {codBlocked ? 'Not available for items in your cart' : 'Pay when your order arrives'}
                  </p>
                </div>
              </button>
            </div>

            {paymentMethod === 'qr_manual' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 rounded-xl border border-brand-100 bg-brand-50/40 p-4"
              >
                <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                  {publicSettings?.payment.qrCodeImage ? (
                    <div className="relative h-36 w-36 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
                      <Image src={publicSettings.payment.qrCodeImage} alt="UPI QR code" fill className="object-contain p-2" />
                    </div>
                  ) : (
                    <div className="flex h-36 w-36 shrink-0 items-center justify-center rounded-lg border border-dashed border-gray-300 text-gray-300">
                      <QrCode className="h-9 w-9" />
                    </div>
                  )}

                  <div className="flex-1 text-center sm:text-left">
                    <p className="text-sm font-semibold text-gray-800">Scan &amp; pay with any UPI app</p>
                    {publicSettings?.payment.upiId && (
                      <p className="mt-1 text-sm text-gray-600">
                        UPI ID: <span className="font-semibold text-gray-900">{publicSettings.payment.upiId}</span>
                      </p>
                    )}

                    <input
                      ref={screenshotInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleScreenshotUpload(file);
                        e.target.value = '';
                      }}
                    />

                    {screenshotUrl ? (
                      <div className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-sm font-semibold text-success sm:justify-start">
                        <CheckCircle2 className="h-4 w-4" /> Payment screenshot attached
                        <button type="button" onClick={() => screenshotInputRef.current?.click()} className="ml-1 text-xs font-medium text-brand-600 underline">
                          Replace
                        </button>
                      </div>
                    ) : (
                      <Button type="button" size="sm" className="mt-3" loading={uploadingScreenshot} onClick={() => screenshotInputRef.current?.click()}>
                        {uploadingScreenshot ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                        Upload Payment Screenshot
                      </Button>
                    )}
                    <p className="mt-2 text-xs text-gray-400">Pay the amount shown in Order Summary, then upload your screenshot before placing the order.</p>
                  </div>
                </div>
              </motion.div>
            )}
          </section>
        </div>

        {cart && (
          <div className="h-fit rounded-xl border border-gray-100 p-5 shadow-card">
            <h2 className="mb-4 font-semibold text-gray-900">Order Summary</h2>
            <ul className="mb-4 max-h-64 space-y-3 overflow-y-auto">
              {activeLines.map((line) => (
                <li key={line.itemId} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {line.name} × {line.quantity}
                  </span>
                  <span className="font-medium text-gray-800">{formatCurrency(line.lineTotal)}</span>
                </li>
              ))}
            </ul>
            <div className="space-y-2 border-t border-gray-100 pt-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (GST)</span>
                <span>{formatCurrency(cart.taxAmount)}</span>
              </div>
              {cart.discountAmount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Discount</span>
                  <span>-{formatCurrency(cart.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{cart.shippingCharge === 0 ? 'Free' : formatCurrency(cart.shippingCharge)}</span>
              </div>
              <div className="flex justify-between border-t border-dashed border-gray-200 pt-2 text-base font-bold text-gray-900">
                <span>Total</span>
                <span>{formatCurrency(cart.totalAmount)}</span>
              </div>
            </div>
            <Button
              className="mt-5 w-full"
              size="lg"
              loading={placing}
              disabled={!selectedAddressId || (paymentMethod === 'qr_manual' && !screenshotUrl)}
              onClick={placeOrder}
            >
              {paymentMethod === 'online' ? `Pay ${formatCurrency(cart.totalAmount)}` : 'Place Order'}
            </Button>
            {paymentMethod === 'qr_manual' && !screenshotUrl && (
              <p className="mt-2 text-center text-xs text-gray-400">Upload your payment screenshot above to enable this button</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

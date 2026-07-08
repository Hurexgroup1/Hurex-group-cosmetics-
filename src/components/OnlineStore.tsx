import React, { useState, useMemo, useEffect } from 'react';
import { Product, OnlineOrder } from '../types';
import { useLanguage } from '../lib/i18n';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { 
  ShoppingBag, 
  Search, 
  Phone, 
  CreditCard, 
  ArrowLeft, 
  Check, 
  Plus, 
  Minus, 
  Trash2, 
  Copy, 
  ExternalLink, 
  MessageCircle, 
  Info,
  Sparkles,
  Package,
  CheckCircle,
  AlertCircle,
  Share2,
  Instagram,
  Facebook,
  Youtube,
  Globe,
  Building,
  Smartphone,
  Truck,
  Clock,
  Play,
  Gift,
  MapPin,
  Compass,
  Send,
  Bot,
  Navigation
} from 'lucide-react';

interface OnlineStoreProps {
  products: Product[];
  whatsappNumber: string;
  lipaNambaMpesa: string;
  lipaNambaTigo: string;
  lipaNambaAirtel?: string;
  wakalaMpesa?: string;
  wakalaTigo?: string;
  wakalaAirtel?: string;
  lipaNambaHalopesa?: string;
  wakalaHalopesa?: string;
  lipaNambaAzampesa?: string;
  bankAccountInfo?: string;
  instagramLink?: string;
  tiktokLink?: string;
  facebookLink?: string;
  youtubeLink?: string;
  paymentInstructions: string;
  systemName: string;
  formatMoney: (amount: number) => string;
  onCloseStoreView?: () => void;
  blackTextEnabled?: boolean;
  onPlaceOnlineOrder?: (order: OnlineOrder) => void;
  shareUrl?: string;

  // New variables for Campaigns, Routing, Tracking, and Analytics
  promoCampaigns?: any[];
  initialProductId?: string | null;
  initialCategory?: string | null;
  initialPromoCode?: string | null;
  initialTrackOrderNo?: string | null;
  onlineOrders?: OnlineOrder[];
}

function CheckoutMap({ 
  lat, 
  lng, 
  onLocationChange, 
  language 
}: { 
  lat: number | null; 
  lng: number | null; 
  onLocationChange: (lat: number, lng: number) => void; 
  language: 'en' | 'sw' 
}) {
  const API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || '';
  const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

  const defaultCenter = { lat: lat || -6.8185, lng: lng || 39.2773 };

  if (!hasValidKey) {
    return (
      <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded-2xl p-4 text-center text-xs text-zinc-500 space-y-1">
        <p className="font-extrabold text-zinc-700 dark:text-zinc-300">
          {language === 'sw' ? '📍 GPS na Utambuzi wa Mahali Tayari' : '📍 GPS and Geolocation Active'}
        </p>
        <p className="text-[10px] text-zinc-400">
          {language === 'sw' 
            ? 'Unaweza kutumia kitufe cha "Saka Mahali kwa GPS" kupata majira nukta bila kikomo.' 
            : 'You can use the "Detect via GPS" button to fetch high-precision coordinates instantly.'}
        </p>
      </div>
    );
  }

  return (
    <div className="h-44 w-full rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-850 shadow-xs relative">
      <APIProvider apiKey={API_KEY} version="weekly">
        <Map
          defaultCenter={defaultCenter}
          defaultZoom={14}
          mapId="HUREX_MAP_ID"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          onClick={(e) => {
            if (e.detail.latLng) {
              onLocationChange(e.detail.latLng.lat, e.detail.latLng.lng);
            }
          }}
          style={{ width: '100%', height: '100%' }}
        >
          <AdvancedMarker 
            position={defaultCenter}
            draggable={true}
            onDragEnd={(e) => {
              if (e.latLng) {
                onLocationChange(e.latLng.lat(), e.latLng.lng());
              }
            }}
          >
            <Pin background="#10b981" glyphColor="#fff" />
          </AdvancedMarker>
        </Map>
      </APIProvider>
    </div>
  );
}

interface CartStoreItem {
  product: Product;
  quantity: number;
}

export default function OnlineStore({
  products,
  whatsappNumber,
  lipaNambaMpesa,
  lipaNambaTigo,
  lipaNambaAirtel = '',
  wakalaMpesa = '',
  wakalaTigo = '',
  wakalaAirtel = '',
  lipaNambaHalopesa = '',
  wakalaHalopesa = '',
  lipaNambaAzampesa = '',
  bankAccountInfo = '',
  instagramLink = '',
  tiktokLink = '',
  facebookLink = '',
  youtubeLink = '',
  paymentInstructions,
  systemName,
  formatMoney,
  onCloseStoreView,
  blackTextEnabled = false,
  onPlaceOnlineOrder,
  shareUrl,
  
  // New props defaults
  promoCampaigns = [],
  initialProductId = null,
  initialCategory = null,
  initialPromoCode = null,
  initialTrackOrderNo = null,
  onlineOrders = []
}: OnlineStoreProps) {
  const { language, setLanguage, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'All');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Store shopping cart
  const [storeCart, setStoreCart] = useState<CartStoreItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCopied, setIsCopied] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [paymentReceiptImage, setPaymentReceiptImage] = useState<string>('');
  const [storeLinkCopied, setStoreLinkCopied] = useState(false);

  // GPS & Delivery states
  const [gpsLat, setGpsLat] = useState<number | null>(null);
  const [gpsLng, setGpsLng] = useState<number | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [deliveryDistanceKm, setDeliveryDistanceKm] = useState<number | null>(null);
  const [deliverySpeed, setDeliverySpeed] = useState<'Standard' | 'Express' | 'Same-Day'>('Standard');
  const [deliveryCompany, setDeliveryCompany] = useState<string>('Hurex Courier');
  const [deliveryFee, setDeliveryFee] = useState<number>(0);
  const [isDetectingGps, setIsDetectingGps] = useState(false);

  // AI Assistant states
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState<Array<{ role: 'user' | 'model', text: string }>>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Initialize AI Welcome Message based on language
  useEffect(() => {
    setAiMessages([
      {
        role: 'model',
        text: language === 'sw' 
          ? "Habari! Mimi ni Msaidizi wako wa Mauzo wa HUREX AI. Naweza kukusaidia kutafuta bidhaa, kupendekeza ofa, na kukokotoa bei za mzigo na usafirishaji. Niandikie chochote!"
          : "Hello! I am your HUREX AI Sales Assistant. I can help you search for products, find active promos, and calculate order or delivery fees. Ask me anything!"
      }
    ]);
  }, [language]);

  // Dynamic delivery fee calculation
  useEffect(() => {
    if (!customerAddress.trim()) {
      setDeliveryFee(0);
      return;
    }

    let baseFee = 2000; // Hurex Courier base fee
    if (deliveryCompany === 'BodaBoda Express') baseFee = 3000;
    else if (deliveryCompany === 'DHL Local') baseFee = 5000;
    else if (deliveryCompany === 'Faras Delivery') baseFee = 2500;

    let distanceCharge = 0;
    if (deliveryDistanceKm !== null) {
      distanceCharge = Math.round(deliveryDistanceKm * 1000); // 1,000 TZS per Km
    } else {
      distanceCharge = 4000; // default flat distance charge if manual text address is entered
    }

    let speedMultiplier = 1.0;
    if (deliverySpeed === 'Express') speedMultiplier = 1.5;
    else if (deliverySpeed === 'Same-Day') speedMultiplier = 2.0;

    const totalQty = storeCart.reduce((sum, item) => sum + item.quantity, 0);
    const quantityCharge = totalQty * 500; // 500 TZS per item quantity

    const calculatedFee = Math.round((baseFee + distanceCharge) * speedMultiplier + quantityCharge);
    setDeliveryFee(calculatedFee);
  }, [deliveryDistanceKm, deliveryCompany, deliverySpeed, storeCart, customerAddress]);

  // Customer store views tab routing: catalog vs tracking
  const [storeViewTab, setStoreViewTab] = useState<'catalog' | 'tracking'>(() => {
    return initialTrackOrderNo ? 'tracking' : 'catalog';
  });

  // Tracking state variables
  const [trackInputNo, setTrackInputNo] = useState(initialTrackOrderNo || '');
  const [searchedTrackOrder, setSearchedTrackOrder] = useState<OnlineOrder | null>(null);

  // Promo discount states
  const [promoCodeInput, setPromoCodeInput] = useState(initialPromoCode || '');
  const [appliedPromoCode, setAppliedPromoCode] = useState<string | null>(null);
  const [promoDiscountPercent, setPromoDiscountPercent] = useState<number>(0);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);

  // Product variants (Size, Color Selection)
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('Default');

  // Customer ratings/reviews state (persisted offline in localStorage)
  const [reviewsState, setReviewsState] = useState<Record<string, any[]>>(() => {
    try {
      const saved = localStorage.getItem('hurex_product_reviews');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    // Default review database for high-fidelity ratings
    return {
      'p1': [
        { id: 'rev-1', name: 'Juma K.', rating: 5, comment: 'Bidhaa hii ni nzuri sana na imara! Nashauri wengine wanunue.', date: '2026-07-01' },
        { id: 'rev-2', name: 'Sarah M.', rating: 4, comment: 'Uwasilishaji ulikuwa wa haraka, ubora umeridhisha kabisa.', date: '2026-07-03' }
      ]
    };
  });

  // Sync reviews state to local storage
  useEffect(() => {
    localStorage.setItem('hurex_product_reviews', JSON.stringify(reviewsState));
  }, [reviewsState]);

  // Review input fields states
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');

  // Auto search tracking order on mount/updates
  useEffect(() => {
    if (trackInputNo && onlineOrders && onlineOrders.length > 0) {
      const found = onlineOrders.find(o => o.orderNo.toUpperCase() === trackInputNo.trim().toUpperCase());
      setSearchedTrackOrder(found || null);
    } else {
      setSearchedTrackOrder(null);
    }
  }, [trackInputNo, onlineOrders]);

  // Direct product routing hook
  useEffect(() => {
    if (initialProductId && products && products.length > 0) {
      const found = products.find(p => p.id === initialProductId);
      if (found) {
        setSelectedProduct(found);
      }
    }
  }, [initialProductId, products]);

  // Split whatsapp numbers if multiple are provided (comma, slash, or space separated)
  const phoneNumbers = useMemo(() => {
    return whatsappNumber
      .split(/[,/; ]+/)
      .map(num => num.trim().replace('+', ''))
      .filter(num => num.length > 0);
  }, [whatsappNumber]);

  const [selectedRecipientPhone, setSelectedRecipientPhone] = useState<string>(() => {
    return phoneNumbers[0] || '255785659204';
  });

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(key);
    setTimeout(() => setIsCopied(null), 2500);
  };

  // Categories list derived dynamically from existing products
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  // Filter products that have stock > 0
  const availableProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Add item to store cart
  const addToCart = (product: Product) => {
    // Check if product is already in cart
    const existingIndex = storeCart.findIndex(item => item.product.id === product.id);
    if (existingIndex !== -1) {
      const updated = [...storeCart];
      if (updated[existingIndex].quantity >= product.quantity) {
        alert(language === 'sw' 
          ? `Onyo: Hakuna stoki ya kutosha ya bidhaa hii kupita ${product.quantity}.` 
          : `Warning: Not enough stock of this product beyond ${product.quantity}.`
        );
        return;
      }
      updated[existingIndex].quantity += 1;
      setStoreCart(updated);
    } else {
      if (product.quantity <= 0) {
        alert(language === 'sw' ? 'Bidhaa hii haipo kwenye stoki kwa sasa.' : 'This product is currently out of stock.');
        return;
      }
      setStoreCart([...storeCart, { product, quantity: 1 }]);
    }
  };

  // Update item quantity in store cart
  const updateQuantity = (productId: string, delta: number) => {
    const updated = storeCart.map(item => {
      if (item.product.id === productId) {
        const newQty = item.quantity + delta;
        if (newQty <= 0) return null;
        if (newQty > item.product.quantity) {
          alert(language === 'sw' 
            ? `Onyo: Stoki iliyopo ni bidhaa ${item.product.quantity} pekee.` 
            : `Warning: Only ${item.product.quantity} items available in stock.`
          );
          return item;
        }
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(Boolean) as CartStoreItem[];
    setStoreCart(updated);
  };

  // Remove item from store cart
  const removeFromCart = (productId: string) => {
    setStoreCart(storeCart.filter(item => item.product.id !== productId));
  };

  const totalCartAmount = storeCart.reduce((sum, item) => sum + (item.product.sellingPrice * item.quantity), 0);
  const totalCartItems = storeCart.reduce((sum, item) => sum + item.quantity, 0);

  // Apply and validate promo code campaign
  const handleApplyPromo = (forcedCode?: string) => {
    setPromoError(null);
    setPromoSuccess(null);
    
    const codeToTest = forcedCode || promoCodeInput;
    if (!codeToTest.trim()) return;

    const cleanCode = codeToTest.trim().toUpperCase();
    const found = (promoCampaigns || []).find(c => c.code.toUpperCase() === cleanCode);

    if (found) {
      const today = new Date().toISOString().split('T')[0];
      if (found.expiryDate && found.expiryDate < today) {
        setPromoError(language === 'sw' ? 'Msimbo huu wa promo umeisha muda wake!' : 'This promo code has expired!');
        setAppliedPromoCode(null);
        setPromoDiscountPercent(0);
        return;
      }
      setAppliedPromoCode(found.code);
      setPromoDiscountPercent(found.discount);
      setPromoSuccess(language === 'sw' 
        ? `Msimbo uliokubaliwa! Umepata punguzo la ${found.discount}%! 🎉` 
        : `Promo code applied! You got ${found.discount}% off! 🎉`
      );
    } else {
      setPromoError(language === 'sw' ? 'Msimbo wa promo haujapatikana!' : 'Promo code not found!');
      setAppliedPromoCode(null);
      setPromoDiscountPercent(0);
    }
  };

  // Detect Location using Browser Geolocation GPS API
  const handleDetectGpsLocation = () => {
    if (!navigator.geolocation) {
      alert(language === 'sw' ? 'Kifaa chako hakiauni utambuzi wa GPS' : 'Your browser does not support GPS Geolocation');
      return;
    }
    setIsDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setGpsLat(lat);
        setGpsLng(lng);
        setGpsAccuracy(position.coords.accuracy);

        // Calculate Haversine distance from Kariakoo Central Warehouse (-6.8185, 39.2773)
        const storeLat = -6.8185;
        const storeLng = 39.2773;
        const R = 6371; // earth radius in km
        const dLat = (lat - storeLat) * Math.PI / 180;
        const dLng = (lng - storeLng) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(storeLat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
          Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        setDeliveryDistanceKm(parseFloat(distance.toFixed(2)));
        setCustomerAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)} (${language === 'sw' ? 'Iliyopatikana kwa GPS' : 'Detected via GPS'})`);
        setIsDetectingGps(false);
      },
      (error) => {
        console.error(error);
        setIsDetectingGps(false);
        alert(language === 'sw' 
          ? 'Imeshindwa kupata eneo lako la GPS. Tafadhali hakikisha GPS imewashwa na uruhusu ufikiaji.' 
          : 'Failed to retrieve GPS location. Please make sure location access is enabled.'
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Local rule-based offline smart assistant fallback
  const handleSendLocalResponse = (msg: string) => {
    const query = msg.toLowerCase();
    let text = '';
    if (language === 'sw') {
      if (query.includes('bei') || query.includes('shilingi') || query.includes('tzs') || query.includes('gharama')) {
        text = "Katalogi yetu ina bidhaa zifuatazo:\n" + products.map(p => `• **${p.name}** - ${formatMoney(p.sellingPrice)}`).join("\n") + "\n\nUnaweza kuongeza bidhaa yoyote kwenye kikapu chako ili kukokotoa bei kamili.";
      } else if (query.includes('ofa') || query.includes('promosheni') || query.includes('promo') || query.includes('punguzo') || query.includes('discount')) {
        text = "Tuna ofa nzuri leo! Tumia promo code: **HUREX20** kupata punguzo la 20% kwenye manunuzi yako yote! Pia tuna ofa ya usafirishaji wa bure kwa Kariakoo.";
      } else if (products.some(p => query.includes(p.name.toLowerCase()) || query.includes(p.category.toLowerCase()))) {
        const matches = products.filter(p => query.includes(p.name.toLowerCase()) || query.includes(p.category.toLowerCase()));
        text = `Nimepata bidhaa hizi zinazolingana na utafutaji wako:\n` + 
          matches.map(p => `• **${p.name}**: ${formatMoney(p.sellingPrice)} (${p.quantity > 0 ? 'Ipo Stoki (' + p.quantity + ')' : 'Imeisha'})`).join('\n') + 
          `\n\nJe, ungependa nikuongezee kwenye kikapu chako?`;
      } else if (query.includes('safiri') || query.includes('delivery') || query.includes('fika') || query.includes('muda') || query.includes('mizigo')) {
        text = "Muda wa kusafirisha mzigo ni kama ifuatavyo:\n• **Express**: Masaa 1-2\n• **Standard**: Masaa 3-6\nAda ya usafirishaji inategemea umbali wa kilomita kutoka Kariakoo Warehouse duka letu kuu (1,000 TZS kwa kila km).";
      } else {
        text = "Habari! Mimi ni Msaidizi wako wa Mauzo wa HUREX AI. Naweza kukusaidia kutafuta bidhaa, kuangalia bei, kukokotoa jumla ya oda, na kupata ofa za leo. \n\nUtafutaji unaoongoza:\n• *Nionyeshe bidhaa zote*\n• *Kuna ofa gani leo?*\n• *Muda wa usafirishaji*";
      }
    } else {
      if (query.includes('price') || query.includes('how much') || query.includes('cost')) {
        text = "Our catalog has the following items:\n" + products.map(p => `• **${p.name}** - ${formatMoney(p.sellingPrice)}`).join("\n") + "\n\nYou can add items to your cart to check the final total.";
      } else if (query.includes('promo') || query.includes('discount') || query.includes('sale') || query.includes('offer')) {
        text = "We have active promotions! Use promo code: **HUREX20** to get 20% off your entire cart. We also have standard delivery discounts for Kariakoo!";
      } else if (products.some(p => query.includes(p.name.toLowerCase()) || query.includes(p.category.toLowerCase()))) {
        const matches = products.filter(p => query.includes(p.name.toLowerCase()) || query.includes(p.category.toLowerCase()));
        text = `I found these products in stock matching your request:\n` + 
          matches.map(p => `• **${p.name}**: ${formatMoney(p.sellingPrice)} (${p.quantity > 0 ? 'In Stock (' + p.quantity + ')' : 'Out of Stock'})`).join('\n') + 
          `\n\nWould you like me to help you add them to your cart?`;
      } else if (query.includes('delivery') || query.includes('shipping') || query.includes('time') || query.includes('how long')) {
        text = "Delivery times and speeds:\n• **Express**: 1-2 hours\n• **Standard**: 3-6 hours\nFees are calculated automatically based on distance from our Kariakoo Warehouse (1,000 TZS per km).";
      } else {
        text = "Hello! I am your HUREX Smart Sales Assistant. I can help you search our catalog, recommend alternatives, calculate order totals, and estimate delivery times. \n\nTry asking:\n• *Do you have any products?*\n• *Show me today's promo codes*\n• *How long does delivery take?*";
      }
    }
    return text;
  };

  // Submit chat to either backend Gemini or local fallback
  const handleSendAiMessage = async () => {
    if (!aiInput.trim() || isAiLoading) return;

    const userMsg = aiInput;
    setAiInput('');
    const updated = [...aiMessages, { role: 'user' as const, text: userMsg }];
    setAiMessages(updated);
    setIsAiLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          history: updated.slice(0, -1),
          products: products,
          language: language
        })
      });

      if (!response.ok) {
        throw new Error('Backend failed');
      }

      const data = await response.json();
      if (data.offline) {
        const fallbackText = handleSendLocalResponse(userMsg);
        setAiMessages(prev => [...prev, { role: 'model', text: fallbackText }]);
      } else {
        setAiMessages(prev => [...prev, { role: 'model', text: data.text }]);
      }
    } catch (err) {
      console.error("AI Error, falling back:", err);
      const fallbackText = handleSendLocalResponse(userMsg);
      setAiMessages(prev => [...prev, { role: 'model', text: fallbackText }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Trigger auto apply of promo if passed in URL on load
  useEffect(() => {
    if (initialPromoCode && promoCampaigns && promoCampaigns.length > 0) {
      handleApplyPromo(initialPromoCode);
    }
  }, [initialPromoCode, promoCampaigns]);

  // Handle submitting customer product reviews
  const handleAddReview = (productId: string) => {
    if (!newReviewName.trim() || !newReviewComment.trim()) return;

    const newRev = {
      id: 'rev-' + Date.now(),
      name: newReviewName,
      rating: newReviewRating,
      comment: newReviewComment,
      date: new Date().toISOString().split('T')[0]
    };

    setReviewsState(prev => {
      const currentReviews = prev[productId] || [];
      const updated = {
        ...prev,
        [productId]: [newRev, ...currentReviews]
      };
      localStorage.setItem('hurex_product_reviews', JSON.stringify(updated));
      return updated;
    });

    setNewReviewName('');
    setNewReviewComment('');
    setNewReviewRating(5);
  };

  // Send single product order to WhatsApp
  const handleSendSingleWhatsAppOrder = (product: Product) => {
    if (onPlaceOnlineOrder) {
      onPlaceOnlineOrder({
        id: 'ord-' + Date.now(),
        orderNo: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
        customerName: language === 'sw' ? 'Mteja wa Haraka' : 'Quick Customer',
        customerPhone: 'WhatsApp Direct',
        customerAddress: language === 'sw' ? 'Kupitia WhatsApp' : 'Via WhatsApp',
        customerNote: language === 'sw' ? `Agizo la haraka la bidhaa moja: ${product.name}` : `Quick single product order: ${product.name}`,
        items: [{
          productId: product.id,
          name: product.name,
          quantity: 1,
          price: product.sellingPrice
        }],
        totalAmount: product.sellingPrice,
        status: 'Pending',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-US', { hour12: false })
      });
    }

    const formattedNum = selectedRecipientPhone;
    
    let paymentDetails = '';
    if (lipaNambaMpesa) paymentDetails += `👉 ${language === 'sw' ? 'M-Pesa Lipa Namba' : 'M-Pesa Till Number'}: ${lipaNambaMpesa}\n`;
    if (wakalaMpesa) paymentDetails += `👉 ${language === 'sw' ? 'M-Pesa (Wakala Code)' : 'M-Pesa (Agent Code)'}: ${wakalaMpesa}\n`;
    if (lipaNambaTigo) paymentDetails += `👉 ${language === 'sw' ? 'Tigo Pesa Lipa Namba' : 'Tigo Pesa Till Number'}: ${lipaNambaTigo}\n`;
    if (wakalaTigo) paymentDetails += `👉 ${language === 'sw' ? 'Tigo Pesa (Wakala Code)' : 'Tigo Pesa (Agent Code)'}: ${wakalaTigo}\n`;
    if (lipaNambaAirtel) paymentDetails += `👉 ${language === 'sw' ? 'Airtel Money Lipa Namba' : 'Airtel Money Till Number'}: ${lipaNambaAirtel}\n`;
    if (wakalaAirtel) paymentDetails += `👉 ${language === 'sw' ? 'Airtel Money (Wakala Code)' : 'Airtel Money (Agent Code)'}: ${wakalaAirtel}\n`;
    if (lipaNambaHalopesa) paymentDetails += `👉 ${language === 'sw' ? 'HaloPesa Lipa Namba' : 'HaloPesa Till Number'}: ${lipaNambaHalopesa}\n`;
    if (wakalaHalopesa) paymentDetails += `👉 ${language === 'sw' ? 'HaloPesa (Wakala Code)' : 'HaloPesa (Agent Code)'}: ${wakalaHalopesa}\n`;
    if (lipaNambaAzampesa) paymentDetails += `👉 ${language === 'sw' ? 'Azam Pesa Lipa Namba' : 'Azam Pesa Till Number'}: ${lipaNambaAzampesa}\n`;
    if (bankAccountInfo) paymentDetails += `👉 ${language === 'sw' ? 'Akaunti ya Benki' : 'Bank Account Info'}: ${bankAccountInfo}\n`;

    const orderTitle = language === 'sw' ? '*AGIZO JIPYA LA BIDHAA (Duka la Mtandaoni)* 🛍️' : '*NEW PRODUCT ORDER (Online Store)* 🛍️';
    const helloText = language === 'sw' ? `Habari! Ningependa kuagiza bidhaa hii kutoka kwenye duka lenu la *${systemName}*:` : `Hello! I would like to order this item from your store *${systemName}*:`;
    const nameLabel = language === 'sw' ? 'Jina la Bidhaa' : 'Product Name';
    const catLabel = language === 'sw' ? 'Kundi' : 'Category';
    const priceLabel = language === 'sw' ? 'Bei ya Bidhaa' : 'Product Price';
    const qtyLabel = language === 'sw' ? 'Idadi' : 'Quantity';
    const paymentMethodsLabel = language === 'sw' ? 'Njia za Malipo za Duka' : 'Store Payment Methods';
    const paymentChatLabel = language === 'sw' ? '👉 Tutaongea hapa chat kuhusu malipo\n' : '👉 We will chat here regarding payment\n';
    const extraLabel = language === 'sw' ? 'Maelezo ya Ziada' : 'Additional Info';
    const closingText = language === 'sw' ? 'Tafadhali nijulishe ikiwa ipo tayari kusafirishwa au kuchukuliwa. Asante sana!' : 'Please let me know when it is ready for delivery or pickup. Thank you!';

    const orderText = `${orderTitle}\n\n` +
      `${helloText}\n\n` +
      `▪️ *${nameLabel}:* ${product.name}\n` +
      `▪️ *${catLabel}:* ${product.category}\n` +
      `▪️ *${priceLabel}:* ${formatMoney(product.sellingPrice)}\n` +
      `▪️ *${qtyLabel}:* 1\n\n` +
      `💵 *${paymentMethodsLabel}:* \n` +
      `${paymentDetails || paymentChatLabel}` +
      `${paymentInstructions ? `👉 ${extraLabel}: ${paymentInstructions}\n` : ''}\n` +
      `${closingText}`;

    const encodedText = encodeURIComponent(orderText);
    const whatsappUrl = `https://wa.me/${formattedNum}?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
  };

  // Send full cart order to WhatsApp
  const handleSendFullWhatsAppOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (storeCart.length === 0) return;

    const discountAmount = Math.round(totalCartAmount * (promoDiscountPercent / 100));
    const netTotalAmount = totalCartAmount - discountAmount;
    const finalTotalWithDelivery = netTotalAmount + deliveryFee;

    if (onPlaceOnlineOrder) {
      onPlaceOnlineOrder({
        id: 'ord-' + Date.now(),
        orderNo: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
        customerName: customerName || (language === 'sw' ? 'Mteja wa Mtandaoni' : 'Online Customer'),
        customerPhone: customerPhone || (language === 'sw' ? 'Haikutajwa' : 'Not Specified'),
        customerAddress: customerAddress || (language === 'sw' ? 'Haikutajwa' : 'Not Specified'),
        customerNote: customerNote || '',
        items: storeCart.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.sellingPrice
        })),
        totalAmount: finalTotalWithDelivery,
        paymentReceiptImage: paymentReceiptImage || undefined,
        status: 'Pending',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-US', { hour12: false }),
        promoCode: appliedPromoCode || undefined,
        discountAmount: discountAmount || undefined,
        deliveryCharge: deliveryFee || undefined,
        paymentMethod: 'Mobile Money',
        gpsLat: gpsLat || undefined,
        gpsLng: gpsLng || undefined,
        deliveryDistanceKm: deliveryDistanceKm || undefined,
        deliverySpeed: deliverySpeed,
        deliveryCompany: deliveryCompany,
        courierAssignStatus: 'Pending'
      });
    }

    const formattedNum = selectedRecipientPhone;
    
    let itemsText = '';
    storeCart.forEach((item, index) => {
      const idadiLabel = language === 'sw' ? 'Idadi' : 'Qty';
      const beiLabel = language === 'sw' ? 'Bei' : 'Price';
      const jumlaLabel = language === 'sw' ? 'Jumla' : 'Total';
      itemsText += `${index + 1}. *${item.product.name}* - ${idadiLabel}: ${item.quantity} (${beiLabel}: ${formatMoney(item.product.sellingPrice)} | ${jumlaLabel}: ${formatMoney(item.product.sellingPrice * item.quantity)})\n`;
    });

    const receiptStatusText = paymentReceiptImage 
      ? (language === 'sw' 
         ? `✅ *Imeambatanishwa kwenye fomu!* (Mteja atatuma picha ya risiti hapa chat sasa hivi)` 
         : `✅ *Attached to the form!* (Customer will send the receipt image here in chat)`)
      : (language === 'sw' 
         ? `❌ *Bado haijaambatanishwa* (Tafadhali kamilisha malipo na utume picha ya risiti hapa chat)` 
         : `❌ *Not attached yet* (Please complete the payment and send the receipt screenshot here in chat)`);

    let paymentDetails = '';
    if (lipaNambaMpesa) paymentDetails += `👉 ${language === 'sw' ? 'M-Pesa Lipa Namba' : 'M-Pesa Till Number'}: ${lipaNambaMpesa}\n`;
    if (wakalaMpesa) paymentDetails += `👉 ${language === 'sw' ? 'M-Pesa (Wakala Code)' : 'M-Pesa (Agent Code)'}: ${wakalaMpesa}\n`;
    if (lipaNambaTigo) paymentDetails += `👉 ${language === 'sw' ? 'Tigo Pesa Lipa Namba' : 'Tigo Pesa Till Number'}: ${lipaNambaTigo}\n`;
    if (wakalaTigo) paymentDetails += `👉 ${language === 'sw' ? 'Tigo Pesa (Wakala Code)' : 'Tigo Pesa (Agent Code)'}: ${wakalaTigo}\n`;
    if (lipaNambaAirtel) paymentDetails += `👉 ${language === 'sw' ? 'Airtel Money Lipa Namba' : 'Airtel Money Till Number'}: ${lipaNambaAirtel}\n`;
    if (wakalaAirtel) paymentDetails += `👉 ${language === 'sw' ? 'Airtel Money (Wakala Code)' : 'Airtel Money (Agent Code)'}: ${wakalaAirtel}\n`;
    if (lipaNambaHalopesa) paymentDetails += `👉 ${language === 'sw' ? 'HaloPesa Lipa Namba' : 'HaloPesa Till Number'}: ${lipaNambaHalopesa}\n`;
    if (wakalaHalopesa) paymentDetails += `👉 ${language === 'sw' ? 'HaloPesa (Wakala Code)' : 'HaloPesa (Agent Code)'}: ${wakalaHalopesa}\n`;
    if (lipaNambaAzampesa) paymentDetails += `👉 ${language === 'sw' ? 'Azam Pesa Lipa Namba' : 'Azam Pesa Till Number'}: ${lipaNambaAzampesa}\n`;
    if (bankAccountInfo) paymentDetails += `👉 ${language === 'sw' ? 'Akaunti ya Benki' : 'Bank Account Info'}: ${bankAccountInfo}\n`;

    const orderTitle = language === 'sw' ? '*AGIZO JIPYA LA KIKAPU (Duka la Mtandaoni)* 🛍️' : '*NEW CART ORDER (Online Store)* 🛍️';
    const helloText = language === 'sw' ? `Habari! Ningependa kuagiza bidhaa zifuatazo kutoka duka lenu la *${systemName}*:` : `Hello! I would like to order the following items from your store *${systemName}*:`;
    const grandTotalLabel = language === 'sw' ? 'JUMLA YA MALIPO' : 'TOTAL PAYMENT';
    const custInfoLabel = language === 'sw' ? 'Taarifa za Mteja' : 'Customer Info';
    const custNameLabel = language === 'sw' ? 'Jina la Mteja' : 'Customer Name';
    const custPhoneLabel = language === 'sw' ? 'Namba ya Simu' : 'Phone Number';
    const custAddressLabel = language === 'sw' ? 'Mahali/Anwani' : 'Address/Location';
    const custNoteLabel = language === 'sw' ? 'Ujumbe wa Ziada' : 'Additional Note';
    const receiptLabel = language === 'sw' ? 'Picha ya Risiti ya Malipo' : 'Payment Receipt Image';
    const paymentMethodsLabel = language === 'sw' ? 'Namba za Malipo zilizoonyeshwa' : 'Displayed Payment Numbers';
    const defaultPaymentMsg = language === 'sw' ? '👉 Tutaongea hapa chat kuhusu malipo\n' : '👉 We will chat here regarding payment\n';
    const orderFooterMsg = language === 'sw' 
      ? 'Nafanya malipo sasa hivi kisha nitatuma stakabadhi/meseji ya muamala. Tafadhali andaa mzigo wangu!' 
      : 'I am making the payment now and will send the transaction receipt/confirmation text. Please prepare my items!';

    const discountText = appliedPromoCode 
      ? `\n🎟️ *PROMO CODE:* ${appliedPromoCode} (-${promoDiscountPercent}%)\n💸 *DISCOUNTED:* ${formatMoney(discountAmount)}`
      : '';

    const speedLabel = language === 'sw' ? 'Kasi ya Usafirishaji' : 'Delivery Speed';
    const companyLabel = language === 'sw' ? 'Kampuni ya Usafirishaji' : 'Delivery Company';
    const distanceLabel = language === 'sw' ? 'Umbali wa Usafirishaji' : 'Delivery Distance';
    const feeLabel = language === 'sw' ? 'Ada ya Usafirishaji' : 'Delivery Fee';
    const gpsLabel = language === 'sw' ? 'Ramani / GPS Pin' : 'GPS Location Link';

    const orderText = `${orderTitle}\n\n` +
      `${helloText}\n\n` +
      `${itemsText}\n` +
      `▪️ *Subtotal:* ${formatMoney(netTotalAmount)}${discountText}\n` +
      `▪️ *${feeLabel}:* ${formatMoney(deliveryFee)} (${deliveryCompany} - ${deliverySpeed})\n` +
      `💰 *${grandTotalLabel}:* ${formatMoney(finalTotalWithDelivery)}\n\n` +
      `👤 *${custInfoLabel}:* \n` +
      `▪️ *${custNameLabel}:* ${customerName || (language === 'sw' ? 'Mteja wa Mtandaoni' : 'Online Customer')}\n` +
      `▪️ *${custPhoneLabel}:* ${customerPhone || (language === 'sw' ? 'Haikutajwa' : 'Not Specified')}\n` +
      `▪️ *${custAddressLabel}:* ${customerAddress || (language === 'sw' ? 'Haikutajwa' : 'Not Specified')}\n` +
      (deliveryDistanceKm !== null ? `▪️ *${distanceLabel}:* ${deliveryDistanceKm} km\n` : '') +
      (gpsLat !== null && gpsLng !== null ? `📍 *${gpsLabel}:* https://maps.google.com/?q=${gpsLat},${gpsLng}\n` : '') +
      `${customerNote ? `▪️ *${custNoteLabel}:* ${customerNote}\n` : ''}` +
      `🧾 *${receiptLabel}:* ${receiptStatusText}\n\n` +
      `💳 *${paymentMethodsLabel}:* \n` +
      `${paymentDetails || defaultPaymentMsg}\n` +
      `${orderFooterMsg}`;

    const encodedText = encodeURIComponent(orderText);
    const whatsappUrl = `https://wa.me/${formattedNum}?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');

    // clear cart and inputs
    setStoreCart([]);
    setIsCartOpen(false);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
    setCustomerNote('');
    setPaymentReceiptImage('');
    setGpsLat(null);
    setGpsLng(null);
    setDeliveryDistanceKm(null);
  };

  return (
    <div className={`min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col transition-colors pb-12 ${blackTextEnabled ? 'black-text-mode' : ''}`} id="online-store-viewport">
      {/* Top Beautiful Header */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-zinc-200/50 dark:border-zinc-800/50 shadow-xs px-4 lg:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onCloseStoreView && (
            <button 
              onClick={onCloseStoreView}
              className="p-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-black cursor-pointer"
              title={language === 'sw' ? "Rudi kwenye POS ya Usimamizi" : "Return to Management POS"}
            >
              <ArrowLeft className="w-4.5 h-4.5" />
              <span className="hidden sm:inline">{language === 'sw' ? "Rudi POS Admin" : "Back to Admin POS"}</span>
            </button>
          )}
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-600 text-white rounded-xl font-black text-xs shadow-xs">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tight text-zinc-900 dark:text-white uppercase leading-none">{systemName}</h1>
              <p className="text-[10px] text-emerald-600 font-bold tracking-wider mt-0.5 uppercase">
                {language === 'sw' ? 'Duka la Mtandaoni (Storefront)' : 'Online Storefront'}
              </p>
            </div>
          </div>
        </div>

        {/* Search Input on Header Desktop */}
        <div className="hidden md:flex relative max-w-md w-96">
          <Search className="absolute left-3.5 top-2.5 w-4.5 h-4.5 text-zinc-400" />
          <input 
            type="text" 
            placeholder={language === 'sw' ? "Tafuta bidhaa unayoipenda duka..." : "Search for your favorite product..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/80 rounded-xl focus:ring-2 focus:ring-emerald-500 text-zinc-800 dark:text-white placeholder-zinc-400 focus:outline-hidden"
          />
        </div>

        {/* Cart Trigger Button */}
        <div className="flex items-center gap-2">
          {/* Quick Language Switcher Button */}
          <button
            onClick={() => setLanguage(language === 'sw' ? 'en' : 'sw')}
            className="p-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer"
            title={language === 'sw' ? 'Badili kwenda English' : 'Switch to Kiswahili'}
          >
            <Globe className="w-4 h-4 text-emerald-600" />
            <span className="font-extrabold uppercase">{language === 'sw' ? 'EN' : 'SW'}</span>
          </button>

          <button
            onClick={() => {
              const storeUrl = shareUrl || `${window.location.origin}${window.location.pathname}?store=true`;
              navigator.clipboard.writeText(storeUrl);
              setStoreLinkCopied(true);
              setTimeout(() => setStoreLinkCopied(false), 3000);
            }}
            className={`p-2.5 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-black cursor-pointer ${
              storeLinkCopied 
                ? 'bg-emerald-600 text-white animate-pulse' 
                : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200'
            }`}
            title={language === 'sw' ? "Saa na marafiki au wateja link ya duka hili!" : "Share this store link with friends or customers!"}
          >
            {storeLinkCopied ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span className="hidden sm:inline">{language === 'sw' ? "Kimegawanywa!" : "Copied!"}</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline">{language === 'sw' ? "Share Link" : "Share Link"}</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-xl hover:bg-emerald-100 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <ShoppingBag className="w-4.5 h-4.5" />
            {totalCartItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white font-black text-[10px] w-5 h-5 flex items-center justify-center rounded-full animate-bounce">
                {totalCartItems}
              </span>
            )}
            <span className="text-xs font-black hidden sm:inline">
              {language === 'sw' ? 'Kikapu' : 'Cart'} ({formatMoney(totalCartAmount)})
            </span>
          </button>
        </div>
      </header>

      {/* Sub-header Tab Bar */}
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-150 dark:border-zinc-800/80 px-4 py-2 flex gap-2 max-w-7xl mx-auto w-full">
        <button
          onClick={() => setStoreViewTab('catalog')}
          className={`flex-1 py-2 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            storeViewTab === 'catalog'
              ? 'bg-emerald-600 text-white shadow-xs font-black'
              : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          {language === 'sw' ? 'Bidhaa (Catalog)' : 'Products (Catalog)'}
        </button>
        <button
          onClick={() => setStoreViewTab('tracking')}
          className={`flex-1 py-2 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            storeViewTab === 'tracking'
              ? 'bg-emerald-600 text-white shadow-xs font-black'
              : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
          }`}
        >
          <Truck className="w-4 h-4" />
          {language === 'sw' ? 'Fuatilia Mzigo (Track)' : 'Track Order'}
        </button>
      </div>

      {storeViewTab === 'tracking' ? (
        <section className="flex-1 max-w-3xl mx-auto w-full px-4 py-8 space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-150 dark:border-zinc-800 shadow-sm text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
              <Truck className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-black text-zinc-900 dark:text-white">
                {language === 'sw' ? 'Fuatilia Maendeleo ya Agizo Lako' : 'Track Your Order Status'}
              </h2>
              <p className="text-xs text-zinc-500">
                {language === 'sw' 
                  ? 'Andika namba ya agizo uliyopewa (Mf. ORD-123456) ili uone hatua ya usafirishaji.' 
                  : 'Enter your order number (e.g. ORD-123456) to view active delivery milestones.'}
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder={language === 'sw' ? "Mf: ORD-123456" : "e.g. ORD-123456"}
                value={trackInputNo}
                onChange={(e) => setTrackInputNo(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-800 dark:text-white placeholder-zinc-400 font-bold focus:ring-1 focus:ring-emerald-500 uppercase focus:outline-hidden"
              />
            </div>
          </div>

          {searchedTrackOrder ? (
            <div className="space-y-6 animate-fade-in">
              {/* Order Info Summary Header */}
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-150 dark:border-zinc-800 shadow-sm space-y-3.5">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] text-zinc-400 uppercase tracking-widest block font-bold">
                      {language === 'sw' ? 'Namba ya Agizo:' : 'Order Number:'}
                    </span>
                    <h3 className="font-black text-sm text-emerald-600 font-mono tracking-tight">{searchedTrackOrder.orderNo}</h3>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 uppercase tracking-widest block font-bold text-right">
                      {language === 'sw' ? 'Hali ya Sasa:' : 'Current Status:'}
                    </span>
                    <span className={`px-2.5 py-1 text-[10px] font-black rounded-lg block text-center uppercase tracking-wide mt-1 ${
                      searchedTrackOrder.status === 'Pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' :
                      searchedTrackOrder.status === 'Cancelled' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400' :
                      searchedTrackOrder.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' :
                      'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                    }`}>
                      {searchedTrackOrder.status === 'Pending' ? (language === 'sw' ? 'Inasubiri' : 'Pending') :
                       searchedTrackOrder.status === 'Confirmed' ? (language === 'sw' ? 'Imethibitishwa' : 'Confirmed') :
                       searchedTrackOrder.status === 'Processing' ? (language === 'sw' ? 'Inaandaliwa' : 'Processing') :
                       searchedTrackOrder.status === 'Packed' ? (language === 'sw' ? 'Imefungashwa' : 'Packed') :
                       searchedTrackOrder.status === 'Shipped' ? (language === 'sw' ? 'Imesafirishwa' : 'Shipped') :
                       searchedTrackOrder.status === 'Delivered' ? (language === 'sw' ? 'Imewasilishwa' : 'Delivered') :
                       (language === 'sw' ? 'Imeghairiwa' : 'Cancelled')}
                    </span>
                  </div>
                </div>

                <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-3.5 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-zinc-400 block font-bold">{language === 'sw' ? 'Mteja:' : 'Customer:'}</span>
                    <p className="font-extrabold text-zinc-700 dark:text-zinc-300">{searchedTrackOrder.customerName}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 block font-bold">{language === 'sw' ? 'Mahali/Anwani:' : 'Location Address:'}</span>
                    <p className="font-extrabold text-zinc-700 dark:text-zinc-300">{searchedTrackOrder.customerAddress}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 block font-bold">{language === 'sw' ? 'Tarehe ya Oda:' : 'Order Date:'}</span>
                    <p className="font-extrabold text-zinc-700 dark:text-zinc-300 font-mono text-[11px]">{searchedTrackOrder.date} {searchedTrackOrder.time}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 block font-bold">{language === 'sw' ? 'Jumla ya Malipo:' : 'Total Amount:'}</span>
                    <p className="font-extrabold text-emerald-600 font-bold">{formatMoney(searchedTrackOrder.totalAmount)}</p>
                  </div>
                </div>
              </div>

              {searchedTrackOrder.status === 'Cancelled' ? (
                <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/50 p-4 rounded-2xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-black text-rose-800 dark:text-rose-300 text-xs uppercase tracking-tight">
                      {language === 'sw' ? 'AGIZO LIMEGHAIRIWA' : 'ORDER CANCELLED'}
                    </h4>
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 leading-normal font-medium">
                      {language === 'sw' 
                        ? 'Agizo hili la mtandaoni limeghairiwa na duka letu. Tafadhali wasiliana nasi kupitia WhatsApp kujua sababu au kurekebisha agizo.' 
                        : 'This online order has been cancelled by our store. Please contact us via WhatsApp to learn more or resolve this issue.'}
                    </p>
                  </div>
                </div>
              ) : (
                /* Beautiful Stepper Progress */
                <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-150 dark:border-zinc-800 shadow-sm space-y-6">
                  <h4 className="text-xs font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-tight flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-emerald-500" />
                    {language === 'sw' ? 'Hatua za Usafirishaji (Milestones):' : 'Delivery Milestones:'}
                  </h4>

                  <div className="relative pl-6 border-l-2 border-zinc-200 dark:border-zinc-800 space-y-8 py-2 ml-2">
                    {[
                      { key: 'Pending', swTitle: 'Inasubiri Uthibitisho', enTitle: 'Pending Confirmation', descSw: 'Agizo limepokelewa vizuri na linasubiri uhakiki wa malipo ya lipa namba.', descEn: 'Order received and awaiting lipa namba pre-payment validation.', icon: Clock },
                      { key: 'Confirmed', swTitle: 'Imethibitishwa', enTitle: 'Confirmed & Paid', descSw: 'Malipo yamethibitishwa na agizo limeingizwa rasmi kwenye mfumo.', descEn: 'Pre-payment received and order is officially logged into the register.', icon: CheckCircle },
                      { key: 'Processing', swTitle: 'Mzigo Unaandaliwa', enTitle: 'Preparing Items', descSw: 'Bidhaa zako zinaandaliwa na kufungashwa kutoka kwenye stoki yetu.', descEn: 'Your items are being handpicked and formatted from inventory.', icon: Play },
                      { key: 'Packed', swTitle: 'Imefungashwa tayari', enTitle: 'Ready & Packed', descSw: 'Mzigo wote upo tayari kwenye bando safi na unangojea msafirishaji.', descEn: 'All products are wrapped securely and waiting for courier dispatch.', icon: Gift },
                      { key: 'Shipped', swTitle: 'Mzigo upo njiani (Shipped)', enTitle: 'Shipped / In Transit', descSw: 'Mzigo umesafirishwa kwa mtoaji huduma na upo njiani kuja kwako.', descEn: 'Your parcel has been handed over to the courier and is in transit.', icon: Truck },
                      { key: 'Delivered', swTitle: 'Mzigo Umewasilishwa', enTitle: 'Delivered Successfully', descSw: 'Mzigo umewasilishwa salama mikononi mwako! Asante sana.', descEn: 'Your parcel has been delivered to your location. Thank you!', icon: CheckCircle }
                    ].map((step, idx) => {
                      const allStatuses = ['Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Delivered'];
                      const currentStatusIdx = allStatuses.indexOf(searchedTrackOrder.status);
                      const stepIdx = allStatuses.indexOf(step.key);

                      const isCompleted = stepIdx <= currentStatusIdx;
                      const isActive = stepIdx === currentStatusIdx;

                      return (
                        <div key={step.key} className="relative">
                          {/* Stepper Dot */}
                          <div className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full flex items-center justify-center border-2 transition-colors z-10 ${
                            isActive ? 'bg-white dark:bg-zinc-900 border-emerald-600 ring-4 ring-emerald-100 dark:ring-emerald-950/50' :
                            isCompleted ? 'bg-emerald-600 border-emerald-600 text-white' :
                            'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
                          }`}>
                            {isCompleted && !isActive && <Check className="w-2 h-2 text-white font-black" />}
                          </div>

                          <div className="space-y-1">
                            <h5 className={`text-xs font-black transition-colors ${
                              isActive ? 'text-emerald-600' :
                              isCompleted ? 'text-zinc-800 dark:text-zinc-100' :
                              'text-zinc-400'
                            }`}>
                              {language === 'sw' ? step.swTitle : step.enTitle}
                              {isActive && <span className="ml-1.5 px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-extrabold text-[8px] rounded-sm uppercase tracking-wider animate-pulse">{language === 'sw' ? 'Sasa' : 'Current'}</span>}
                            </h5>
                            <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">
                              {language === 'sw' ? step.descSw : step.descEn}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Direct WhatsApp Call to Action for Order support */}
              <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 p-5 rounded-3xl space-y-3.5">
                <h4 className="text-xs font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-tight">
                  {language === 'sw' ? 'Unahitaji Msaada Zaidi?' : 'Need Instant Assistance?'}
                </h4>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 leading-relaxed font-medium">
                  {language === 'sw' 
                    ? 'Bofya kitufe hapa chini ili uwasiliane moja kwa moja na muuzaji WhatsApp kujua maendeleo ya agizo lako au kubadilisha maelezo.' 
                    : 'Click the button below to text the seller directly on WhatsApp to query your delivery status or modify notes.'}
                </p>
                <a
                  href={`https://wa.me/${selectedRecipientPhone}?text=${encodeURIComponent(
                    language === 'sw' 
                      ? `Habari, naomba kujua maendeleo ya agizo langu namba *${searchedTrackOrder.orderNo}* linalomiliki jina la *${searchedTrackOrder.customerName}*.`
                      : `Hello, I would like to check on my order *${searchedTrackOrder.orderNo}* placed under the name *${searchedTrackOrder.customerName}*.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-white" />
                  {language === 'sw' ? 'Ongea na Muuzaji WhatsApp' : 'Chat with Seller on WhatsApp'}
                </a>
              </div>
            </div>
          ) : trackInputNo.trim() !== '' ? (
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-150 dark:border-zinc-800 shadow-sm text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
              <div className="space-y-1">
                <h4 className="font-black text-zinc-800 dark:text-zinc-200 text-xs uppercase tracking-tight">
                  {language === 'sw' ? 'Agizo Halikupatikana!' : 'Order Not Found!'}
                </h4>
                <p className="text-[11px] text-zinc-500 leading-normal max-w-sm mx-auto">
                  {language === 'sw' 
                    ? `Hajakuta agizo lolote lenye namba '${trackInputNo.toUpperCase()}'. Tafadhali hakikisha umeandika kwa usahihi au wasiliana na duka kwa WhatsApp.` 
                    : `We could not locate any order with code '${trackInputNo.toUpperCase()}'. Please double-check the spelling or ask the seller on WhatsApp.`}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-150 dark:border-zinc-800 shadow-sm text-center text-zinc-400 py-12">
              <Truck className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
              <p className="text-[11px] italic font-medium">
                {language === 'sw' ? 'Ingiza namba ya oda hapo juu ili kuanza kufuatilia...' : 'Enter your order number above to start tracking...'}
              </p>
            </div>
          )}
        </section>
      ) : (
        <>
          {/* Hero Store Promotion Banner */}
      <section className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white py-8 px-6 lg:px-12 rounded-b-3xl shadow-sm text-center max-w-7xl mx-auto w-full mt-4 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-left max-w-xl space-y-2">
          <span className="px-2.5 py-1 bg-white/20 text-white font-extrabold text-[10px] tracking-widest uppercase rounded-full">
            {language === 'sw' ? 'Karibu Sana Mteja wetu!' : 'Welcome Valued Customer!'}
          </span>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">
            {language === 'sw' ? 'Chagua Bidhaa, Lipia Rahisi & Agiza Kupitia WhatsApp!' : 'Select Products, Pay Easily & Order via WhatsApp!'}
          </h2>
          <p className="text-xs text-emerald-100/90 leading-relaxed font-medium">
            {language === 'sw' 
              ? 'Tumerahisisha ununuzi. Gusa bidhaa uipendayo au ongeza kwenye kikapu, chagua Lipa Namba ya malipo, kisha bofya kutuma agizo moja kwa moja kwenda WhatsApp yetu. Tutajibu mara moja!'
              : 'We have simplified shopping. Tap your favorite product or add it to the cart, select your payment method, then tap to send your order directly to our WhatsApp. We will respond instantly!'}
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-xs p-4 rounded-2xl border border-white/10 w-full md:max-w-sm text-left space-y-2 text-xs shrink-0 max-h-72 overflow-y-auto scrollbar-none">
          <h4 className="font-extrabold flex items-center gap-1.5 text-white">
            <CreditCard className="w-4 h-4 text-emerald-300" />
            {language === 'sw' ? 'Taarifa za Malipo ya Duka' : 'Store Payment Methods'}
          </h4>
          <div className="space-y-1.5">
            {lipaNambaMpesa && (
              <div className="flex justify-between items-center bg-white/5 px-2.5 py-1 rounded-lg">
                <span className="text-[11px] text-zinc-100">Lipa M-Pesa (Vodacom):</span>
                <span className="font-mono font-black text-emerald-200 text-xs">{lipaNambaMpesa}</span>
              </div>
            )}
            {wakalaMpesa && (
              <div className="flex justify-between items-center bg-white/5 px-2.5 py-1 rounded-lg">
                <span className="text-[11px] text-zinc-100">{language === 'sw' ? 'M-Pesa (Wakala Code):' : 'M-Pesa (Agent Code):'}</span>
                <span className="font-mono font-black text-emerald-200 text-xs">{wakalaMpesa}</span>
              </div>
            )}
            {lipaNambaTigo && (
              <div className="flex justify-between items-center bg-white/5 px-2.5 py-1 rounded-lg">
                <span className="text-[11px] text-zinc-100">Lipa Tigo Pesa:</span>
                <span className="font-mono font-black text-emerald-200 text-xs">{lipaNambaTigo}</span>
              </div>
            )}
            {wakalaTigo && (
              <div className="flex justify-between items-center bg-white/5 px-2.5 py-1 rounded-lg">
                <span className="text-[11px] text-zinc-100">{language === 'sw' ? 'Tigo (Wakala Code):' : 'Tigo (Agent Code):'}</span>
                <span className="font-mono font-black text-emerald-200 text-xs">{wakalaTigo}</span>
              </div>
            )}
            {lipaNambaAirtel && (
              <div className="flex justify-between items-center bg-white/5 px-2.5 py-1 rounded-lg">
                <span className="text-[11px] text-zinc-100">Lipa Airtel Money:</span>
                <span className="font-mono font-black text-emerald-200 text-xs">{lipaNambaAirtel}</span>
              </div>
            )}
            {wakalaAirtel && (
              <div className="flex justify-between items-center bg-white/5 px-2.5 py-1 rounded-lg">
                <span className="text-[11px] text-zinc-100">{language === 'sw' ? 'Airtel (Wakala Code):' : 'Airtel (Agent Code):'}</span>
                <span className="font-mono font-black text-emerald-200 text-xs">{wakalaAirtel}</span>
              </div>
            )}
            {lipaNambaHalopesa && (
              <div className="flex justify-between items-center bg-white/5 px-2.5 py-1 rounded-lg">
                <span className="text-[11px] text-zinc-100">Lipa HaloPesa:</span>
                <span className="font-mono font-black text-emerald-200 text-xs">{lipaNambaHalopesa}</span>
              </div>
            )}
            {wakalaHalopesa && (
              <div className="flex justify-between items-center bg-white/5 px-2.5 py-1 rounded-lg">
                <span className="text-[11px] text-zinc-100">{language === 'sw' ? 'Halotel (Wakala Code):' : 'Halotel (Agent Code):'}</span>
                <span className="font-mono font-black text-emerald-200 text-xs">{wakalaHalopesa}</span>
              </div>
            )}
            {lipaNambaAzampesa && (
              <div className="flex justify-between items-center bg-white/5 px-2.5 py-1 rounded-lg">
                <span className="text-[11px] text-zinc-100">Lipa Azam Pesa:</span>
                <span className="font-mono font-black text-emerald-200 text-xs">{lipaNambaAzampesa}</span>
              </div>
            )}
            {bankAccountInfo && (
              <div className="bg-white/5 px-2.5 py-1.5 rounded-lg text-[10px] text-emerald-200 leading-normal">
                <span className="font-bold block text-[9px] text-white uppercase tracking-wider mb-0.5">
                  {language === 'sw' ? 'Akaunti ya Benki:' : 'Bank Account Info:'}
                </span>
                {bankAccountInfo}
              </div>
            )}
          </div>
          <p className="text-[9px] text-emerald-200/85 text-center mt-1">
            {language === 'sw' ? 'Njia hizi zitatumika kukamilisha agizo lako.' : 'These options will be used to complete your payment.'}
          </p>
        </div>
      </section>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6 flex-1 w-full space-y-6">
        {/* Mobile Search Bar */}
        <div className="block md:hidden relative w-full">
          <Search className="absolute left-3.5 top-2.5 w-4.5 h-4.5 text-zinc-400" />
          <input 
            type="text" 
            placeholder={language === 'sw' ? "Tafuta bidhaa unayoipenda hapa..." : "Search for your favorite products..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-800 dark:text-white placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Categories Tags Scrollbar */}
        <div className="flex gap-2 scrollbar-none overflow-x-auto py-1">
          {categories.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                selectedCategory === cat 
                  ? 'bg-emerald-600 text-white shadow-xs' 
                  : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200/50 dark:border-zinc-800 hover:bg-zinc-100'
              }`}
            >
              {cat === 'All' ? (language === 'sw' ? '🗂️ Bidhaa Zote' : '🗂️ All Products') : `${cat}`}
            </button>
          ))}
        </div>

        {/* Store Catalog Grid */}
        <div>
          {availableProducts.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-12 text-center border border-zinc-150 dark:border-zinc-800/60 max-w-lg mx-auto space-y-4">
              <Package className="w-12 h-12 text-zinc-300 mx-auto" />
              <h3 className="font-bold text-base text-zinc-700 dark:text-zinc-300">
                {language === 'sw' ? "Hakuna bidhaa duka kwa sasa" : "No products in store currently"}
              </h3>
              <p className="text-xs text-zinc-400">
                {language === 'sw' 
                  ? "Tafadhali rejea hapa baadae au wasiliana na muuzaji kwa msaada zaidi." 
                  : "Please return later or contact the seller for further assistance."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {availableProducts.map((p) => {
                const isInCart = storeCart.some(item => item.product.id === p.id);
                const isOutOfStock = p.quantity <= 0;

                return (
                  <div 
                    key={p.id} 
                    className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/40 dark:border-zinc-800/40 overflow-hidden hover:shadow-md transition-all flex flex-col group relative"
                  >
                    {/* Badge for out of stock or categories */}
                    {isOutOfStock ? (
                      <span className="absolute top-2 left-2 z-10 px-2 py-0.5 bg-red-600 text-white font-extrabold text-[9px] rounded-md uppercase">
                        {language === 'sw' ? "Imeisha Stoki" : "Out of Stock"}
                      </span>
                    ) : p.quantity <= p.minStock ? (
                      <span className="absolute top-2 left-2 z-10 px-2 py-0.5 bg-amber-500 text-white font-extrabold text-[9px] rounded-md uppercase">
                        {language === 'sw' ? "Mwisho wa Stoki" : "Low Stock"}
                      </span>
                    ) : null}

                    {/* Image Area */}
                    <div 
                      onClick={() => !isOutOfStock && setSelectedProduct(p)}
                      className="aspect-square bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center border-b border-zinc-100 dark:border-zinc-800 overflow-hidden cursor-pointer relative"
                    >
                      {p.image ? (
                        <img 
                          src={p.image} 
                          className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                          referrerPolicy="no-referrer" 
                          alt={p.name} 
                        />
                      ) : (
                        <Package className="w-12 h-12 text-zinc-300 group-hover:scale-105 transition-transform" />
                      )}
                    </div>

                    {/* Meta info */}
                    <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                      <div>
                        <span className="text-[9px] text-zinc-400 uppercase font-black tracking-wider block mb-0.5">
                          {p.category}
                        </span>
                        <h4 
                          onClick={() => !isOutOfStock && setSelectedProduct(p)}
                          className="font-black text-xs text-zinc-800 dark:text-zinc-100 hover:text-emerald-600 transition-colors line-clamp-2 cursor-pointer"
                        >
                          {p.name}
                        </h4>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-baseline gap-1">
                          <span className="text-xs font-black text-zinc-900 dark:text-white">{formatMoney(p.sellingPrice)}</span>
                        </div>

                        {/* Order Options */}
                        <div className="space-y-1 pt-1.5">
                          <button
                            onClick={() => addToCart(p)}
                            disabled={isOutOfStock}
                            className={`w-full py-1.5 text-[10px] font-black rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                              isOutOfStock 
                                ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed'
                                : isInCart 
                                  ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 hover:bg-emerald-100'
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            }`}
                          >
                            {isInCart ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                {language === 'sw' ? 'Ipo Kikapuni' : 'In Cart'} ({storeCart.find(i => i.product.id === p.id)?.quantity})
                              </>
                            ) : (
                              language === 'sw' ? 'Weka Kikapuni' : 'Add to Cart'
                            )}
                          </button>

                          <button
                            onClick={() => handleSendSingleWhatsAppOrder(p)}
                            disabled={isOutOfStock}
                            className="w-full py-1.5 bg-zinc-50 hover:bg-emerald-50 dark:bg-zinc-800/50 dark:hover:bg-emerald-950/20 text-zinc-700 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400 border border-zinc-200/30 dark:border-zinc-800 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                            {language === 'sw' ? 'Agiza WhatsApp pekee' : 'Order via WhatsApp'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </>
  )}

      {/* FOOTER */}
      <footer className="mt-12 border-t border-zinc-200/50 dark:border-zinc-800/50 bg-white dark:bg-zinc-900 py-8 px-6 text-center text-xs text-zinc-400">
        <p className="font-extrabold text-zinc-600 dark:text-zinc-300 uppercase tracking-widest">{systemName} ONLINE CATALOG</p>
        <p className="mt-1 text-[10px]">
          {language === 'sw' 
            ? 'Lete maagizo yako haraka, rahisi na kwa usalama kabisa kupitia WhatsApp.' 
            : 'Send your orders fast, simple, and securely via WhatsApp.'}
        </p>
        <p className="mt-4 text-[9px] text-zinc-400">
          © 2026 {systemName}. {language === 'sw' ? 'Haki zote zimehifadhiwa.' : 'All rights reserved.'} Powered by HUREX GROUP OF COMPANIES.
        </p>
      </footer>

      {/* PRODUCT DETAILS DIALOG/MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-lg border border-zinc-150 dark:border-zinc-800 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 bg-zinc-50/50 dark:bg-zinc-800/10 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
              <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">
                {language === 'sw' ? 'Maelezo ya Bidhaa duka' : 'Store Product Details'}
              </span>
              <button 
                onClick={() => setSelectedProduct(null)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto">
              <div className="flex flex-col sm:flex-row gap-5 items-center">
                {/* Product Image */}
                <div className="w-32 h-32 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800/80 flex items-center justify-center overflow-hidden shrink-0">
                  {selectedProduct.image ? (
                    <img src={selectedProduct.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt={selectedProduct.name} />
                  ) : (
                    <Package className="w-10 h-10 text-zinc-300" />
                  )}
                </div>

                <div className="space-y-2 flex-1 text-center sm:text-left">
                  <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-extrabold text-[9px] uppercase tracking-wider rounded-md">
                    {selectedProduct.category}
                  </span>
                  <h3 className="font-black text-sm text-zinc-900 dark:text-white leading-tight">
                    {selectedProduct.name}
                  </h3>
                  <div className="text-base font-black text-emerald-600">
                    {language === 'sw' ? 'Bei duka:' : 'Store price:'} {formatMoney(selectedProduct.sellingPrice)}
                  </div>
                  <div className="text-[10px] text-zinc-400">
                    {language === 'sw' ? 'Stoki inayopatikana:' : 'Available stock:'} <span className="font-bold text-zinc-700 dark:text-zinc-300">{selectedProduct.quantity} pack(s)</span>
                  </div>
                </div>
              </div>

              {/* Product Options (Variants Selector) */}
              <div className="bg-zinc-50 dark:bg-zinc-850 p-3 rounded-2xl border border-zinc-150 dark:border-zinc-800 space-y-2">
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">
                  {language === 'sw' ? 'Chagua Ukubwa & Rangi (Variants):' : 'Select Size & Color (Variants):'}
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                      {language === 'sw' ? 'Ukubwa:' : 'Size:'}
                    </label>
                    <div className="flex gap-1">
                      {['S', 'M', 'L', 'XL'].map(sz => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setSelectedSize(sz)}
                          className={`flex-1 py-1 text-[10px] font-black rounded-lg border transition-all cursor-pointer ${
                            selectedSize === sz
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                              : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300'
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                      {language === 'sw' ? 'Rangi:' : 'Color:'}
                    </label>
                    <div className="flex gap-1">
                      {['Nyeusi', 'Nyeupe', 'Kijivu', 'Nyekundu'].map((cl, idx) => {
                        const colorsEn = ['Black', 'White', 'Gray', 'Red'];
                        const disp = language === 'sw' ? cl : colorsEn[idx];
                        return (
                          <button
                            key={cl}
                            type="button"
                            onClick={() => setSelectedColor(cl)}
                            className={`flex-1 py-1 text-[9px] font-black rounded-lg border transition-all truncate cursor-pointer ${
                              selectedColor === cl
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300'
                            }`}
                            title={disp}
                          >
                            {disp}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Reviews & Ratings section */}
              <div className="bg-zinc-50 dark:bg-zinc-850 p-3 rounded-2xl border border-zinc-150 dark:border-zinc-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                    {language === 'sw' ? 'Maoni ya Wateja:' : 'Customer Reviews:'}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-black text-amber-500">★</span>
                    <span className="text-[11px] font-black text-zinc-800 dark:text-zinc-200">
                      {((reviewsState[selectedProduct.id] || []).reduce((acc, curr) => acc + curr.rating, 0) / Math.max(1, (reviewsState[selectedProduct.id] || []).length)).toFixed(1)} / 5.0
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      ({(reviewsState[selectedProduct.id] || []).length})
                    </span>
                  </div>
                </div>

                {/* Review List */}
                <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
                  {(reviewsState[selectedProduct.id] || []).length === 0 ? (
                    <p className="text-[10px] text-zinc-400 italic text-center py-2">
                      {language === 'sw' ? 'Bado hakuna maoni ya bidhaa hii. Kuwa wa kwanza kuandika!' : 'No reviews yet for this product. Be the first to review!'}
                    </p>
                  ) : (
                    (reviewsState[selectedProduct.id] || []).map((rev: any) => (
                      <div key={rev.id} className="bg-white dark:bg-zinc-900 p-2 rounded-xl border border-zinc-100 dark:border-zinc-800 space-y-0.5">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-black text-zinc-700 dark:text-zinc-300">{rev.name}</span>
                          <span className="text-[9px] text-zinc-400">{rev.date}</span>
                        </div>
                        <div className="flex text-amber-500 text-[9px]">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i}>{i < rev.rating ? '★' : '☆'}</span>
                          ))}
                        </div>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-normal">{rev.comment}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Review Form */}
                <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800 space-y-2">
                  <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest block">
                    {language === 'sw' ? 'Andika Maoni yako:' : 'Write a Review:'}
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <input
                      type="text"
                      placeholder={language === 'sw' ? "Jina lako" : "Your Name"}
                      value={newReviewName}
                      onChange={(e) => setNewReviewName(e.target.value)}
                      className="px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-800 dark:text-white focus:outline-hidden text-[10px]"
                    />
                    <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1">
                      <span className="text-[9px] text-zinc-400 font-bold">{language === 'sw' ? 'Nyota:' : 'Stars:'}</span>
                      <select
                        value={newReviewRating}
                        onChange={(e) => setNewReviewRating(Number(e.target.value))}
                        className="bg-transparent font-bold text-amber-500 focus:outline-hidden cursor-pointer"
                      >
                        {[5, 4, 3, 2, 1].map(v => (
                          <option key={v} value={v}>{'★'.repeat(v)}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={language === 'sw' ? "Andika maoni yako hapa..." : "Write comments..."}
                      value={newReviewComment}
                      onChange={(e) => setNewReviewComment(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-800 dark:text-white focus:outline-hidden text-[10px]"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddReview(selectedProduct.id)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-lg text-[10px] cursor-pointer"
                    >
                      {language === 'sw' ? 'Weka' : 'Send'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Payment Methods Section */}
              <div className="bg-zinc-50 dark:bg-zinc-850 p-4 rounded-2xl space-y-2 border border-zinc-200/40 dark:border-zinc-800/40">
                <h4 className="text-xs font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-tight flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-500" />
                  {language === 'sw' ? 'Njia na Namba za Malipo (Duka):' : 'Store Payment Numbers:'}
                </h4>
                <p className="text-[10px] text-zinc-400">
                  {language === 'sw' 
                    ? 'Unaweza kufanya malipo ya awali kupitia lipa namba zifuatazo kisha utatuma uthibitisho WhatsApp:' 
                    : 'You can pre-pay using the following payment numbers, then send your confirmation receipt on WhatsApp:'}
                </p>
                <div className="space-y-1.5 pt-1.5 text-[11px]">
                  {lipaNambaMpesa && (
                    <div className="flex justify-between items-center bg-white dark:bg-zinc-900 p-2 rounded-xl border border-zinc-100 dark:border-zinc-800/50">
                      <span className="font-bold flex items-center gap-1">🔴 Vodacom M-Pesa:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-black font-mono text-zinc-900 dark:text-white">{lipaNambaMpesa}</span>
                        <button 
                          onClick={() => handleCopy(lipaNambaMpesa, 'mpesa')}
                          className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-blue-500 rounded-md cursor-pointer"
                          title="Copy LIPA NAMBA"
                        >
                          {isCopied === 'mpesa' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  )}
                  {lipaNambaTigo && (
                    <div className="flex justify-between items-center bg-white dark:bg-zinc-900 p-2 rounded-xl border border-zinc-100 dark:border-zinc-800/50">
                      <span className="font-bold flex items-center gap-1">🔵 Tigo Pesa:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-black font-mono text-zinc-900 dark:text-white">{lipaNambaTigo}</span>
                        <button 
                          onClick={() => handleCopy(lipaNambaTigo, 'tigo')}
                          className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-blue-500 rounded-md cursor-pointer"
                          title="Copy LIPA NAMBA"
                        >
                          {isCopied === 'tigo' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  )}
                  {paymentInstructions && (
                    <div className="p-2 bg-white dark:bg-zinc-900 rounded-xl text-[10px] text-zinc-500 dark:text-zinc-400 border border-zinc-100 dark:border-zinc-800/50 flex items-start gap-1.5">
                      <Info className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                      <span>{paymentInstructions}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2.5 pt-2">
                <button
                  onClick={() => {
                    addToCart(selectedProduct);
                    setSelectedProduct(null);
                  }}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  {language === 'sw' ? 'Weka Kwenye Kikapu' : 'Add to Cart'}
                </button>
                <button
                  onClick={() => {
                    handleSendSingleWhatsAppOrder(selectedProduct);
                    setSelectedProduct(null);
                  }}
                  className="flex-1 py-2.5 bg-zinc-900 hover:bg-black text-white dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-xl text-xs font-black transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  {language === 'sw' ? 'Agiza Sasa WhatsApp' : 'Order Now on WhatsApp'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SHOPPING CART OVERLAY / SIDEBAR */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex justify-end z-50 animate-fade-in" id="cart-drawer-overlay">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md h-full flex flex-col shadow-2xl border-l border-zinc-200 dark:border-zinc-800 animate-slide-left">
            {/* Header */}
            <div className="p-4.5 bg-zinc-50 dark:bg-zinc-850 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center shrink-0">
              <span className="flex items-center gap-2">
                <ShoppingBag className="w-4.5 h-4.5 text-emerald-600" />
                <h3 className="font-black text-sm text-zinc-900 dark:text-white uppercase tracking-tight">
                  {language === 'sw' ? 'Kikapu chako cha Manunuzi' : 'Your Shopping Cart'}
                </h3>
              </span>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin">
              {storeCart.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center space-y-3 text-zinc-400 py-12">
                  <ShoppingBag className="w-10 h-10 text-zinc-300" />
                  <p className="text-xs font-bold">
                    {language === 'sw' ? 'Kikapu chako kipo wazi kwa sasa.' : 'Your cart is currently empty.'}
                  </p>
                  <p className="text-[10px] text-zinc-400/80 max-w-[200px]">
                    {language === 'sw' 
                      ? 'Gusa vifungo vya "Weka Kikapuni" ili kuanza kukusanya bidhaa zako.' 
                      : 'Tap "Add to Cart" to start adding items to your cart.'}
                  </p>
                </div>
              ) : (
                <>
                  {storeCart.map((item) => (
                    <div 
                      key={item.product.id}
                      className="flex gap-3.5 p-3 bg-zinc-50 dark:bg-zinc-850 border border-zinc-200/40 dark:border-zinc-800/40 rounded-2xl items-center"
                    >
                      {/* Thumbnail */}
                      <div className="w-12 h-12 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800/50 flex items-center justify-center overflow-hidden shrink-0">
                        {item.product.image ? (
                          <img src={item.product.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt={item.product.name} />
                        ) : (
                          <Package className="w-6 h-6 text-zinc-300" />
                        )}
                      </div>

                      {/* Detail Column */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-extrabold text-xs text-zinc-800 dark:text-zinc-200 truncate">{item.product.name}</h4>
                        <p className="text-[10px] text-emerald-600 font-bold mt-0.5">{formatMoney(item.product.sellingPrice)}</p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-lg p-1">
                        <button 
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="p-1 text-zinc-500 hover:text-zinc-800 dark:hover:text-white"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-1.5 text-xs font-black text-zinc-800 dark:text-zinc-100">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.product.id, 1)}
                          className="p-1 text-zinc-500 hover:text-zinc-800 dark:hover:text-white"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Delete */}
                      <button 
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-zinc-400 hover:text-red-500 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {/* Customer Information Form */}
                  <form onSubmit={handleSendFullWhatsAppOrder} className="pt-4 border-t border-zinc-200/50 dark:border-zinc-800/50 space-y-3.5 text-xs">
                    <h4 className="text-xs font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-tight flex items-center gap-1">
                      <Sparkles className="w-4 h-4 text-emerald-500" />
                      {language === 'sw' ? 'Taarifa za Agizo lako:' : 'Your Order details:'}
                    </h4>

                    {/* Promo Code Campaign Field */}
                    <div className="bg-zinc-50 dark:bg-zinc-850 p-3 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 space-y-2">
                      <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                        {language === 'sw' ? 'Msimbo wa Punguzo (Promo Code):' : 'Discount Promo Code:'}
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={promoCodeInput}
                          onChange={(e) => setPromoCodeInput(e.target.value)}
                          placeholder={language === 'sw' ? "Mf. SUMMER50" : "e.g. SUMMER50"}
                          className="flex-1 px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-800 dark:text-white uppercase focus:ring-1 focus:ring-emerald-500 focus:outline-hidden font-bold text-xs"
                        />
                        <button 
                          type="button"
                          onClick={() => handleApplyPromo()}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl transition-all text-xs cursor-pointer"
                        >
                          {language === 'sw' ? 'Weka' : 'Apply'}
                        </button>
                      </div>
                      {promoError && (
                        <p className="text-[10px] text-rose-500 font-bold">⚠️ {promoError}</p>
                      )}
                      {promoSuccess && (
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">🎉 {promoSuccess}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                        {language === 'sw' ? 'Jina lako Kamili:' : 'Your Full Name:'}
                      </label>
                      <input 
                        type="text" 
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder={language === 'sw' ? "Mf. Juma Kassim" : "e.g. John Doe"}
                        className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-1 focus:ring-emerald-500 text-zinc-800 dark:text-white focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                        {language === 'sw' ? 'Namba yako ya Simu:' : 'Your Phone Number:'}
                      </label>
                      <input 
                        type="tel" 
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder={language === 'sw' ? "Mf. 0712345678" : "e.g. 0712345678"}
                        className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-1 focus:ring-emerald-500 text-zinc-800 dark:text-white focus:outline-hidden"
                      />
                    </div>

                    {phoneNumbers.length > 1 && (
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                          {language === 'sw' ? 'Tuma Oda kwenda Namba ya WhatsApp:' : 'Send Order to WhatsApp:'}
                        </label>
                        <select 
                          value={selectedRecipientPhone}
                          onChange={(e) => setSelectedRecipientPhone(e.target.value)}
                          className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-1 focus:ring-emerald-500 text-zinc-800 dark:text-white font-bold focus:outline-hidden cursor-pointer"
                        >
                          {phoneNumbers.map((num, idx) => {
                            const cleanNum = num.trim();
                            let label = cleanNum;
                            if (cleanNum.endsWith('785659204')) {
                              label = language === 'sw' ? '0785659204 (Hurex Primary)' : '0785659204 (Primary)';
                            } else if (cleanNum.endsWith('761929290')) {
                              label = language === 'sw' ? '0761929290 (Hurex Alternative)' : '0761929290 (Alternative)';
                            } else {
                              label = `${language === 'sw' ? 'Namba' : 'Number'} ${idx + 1}: ${cleanNum}`;
                            }
                            return (
                              <option key={cleanNum} value={cleanNum}>
                                {label}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    )}

                    {/* GPS Location, Map and Courier Selections */}
                    <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                          {language === 'sw' ? 'Mbinu na Mahali pa Usafirishaji:' : 'Delivery Options & GPS:'}
                        </span>
                        
                        <button
                          type="button"
                          onClick={handleDetectGpsLocation}
                          disabled={isDetectingGps}
                          className="flex items-center gap-1 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-bold transition-all border border-emerald-100 dark:border-emerald-900/30 cursor-pointer"
                        >
                          <Compass className={`w-3.5 h-3.5 ${isDetectingGps ? 'animate-spin' : ''}`} />
                          <span>
                            {isDetectingGps 
                              ? (language === 'sw' ? 'Inasaka GPS...' : 'Detecting GPS...') 
                              : (language === 'sw' ? 'Saka kwa GPS' : 'Detect via GPS')}
                          </span>
                        </button>
                      </div>

                      {/* Map display */}
                      <CheckoutMap 
                        lat={gpsLat} 
                        lng={gpsLng} 
                        onLocationChange={(newLat, newLng) => {
                          setGpsLat(newLat);
                          setGpsLng(newLng);
                          // recalculate Haversine distance from Kariakoo (-6.8185, 39.2773)
                          const storeLat = -6.8185;
                          const storeLng = 39.2773;
                          const R = 6371;
                          const dLat = (newLat - storeLat) * Math.PI / 180;
                          const dLng = (newLng - storeLng) * Math.PI / 180;
                          const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                            Math.cos(storeLat * Math.PI / 180) * Math.cos(newLat * Math.PI / 180) *
                            Math.sin(dLng / 2) * Math.sin(dLng / 2);
                          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                          const distance = R * c;
                          setDeliveryDistanceKm(parseFloat(distance.toFixed(2)));
                          setCustomerAddress(`${newLat.toFixed(5)}, ${newLng.toFixed(5)} (${language === 'sw' ? 'Ramani Iliyochaguliwa' : 'Map Selected Pin'})`);
                        }}
                        language={language}
                      />

                      {/* Display coordinates & distance */}
                      {deliveryDistanceKm !== null && (
                        <div className="flex justify-between items-center bg-zinc-100 dark:bg-zinc-800/50 px-3 py-2 rounded-xl text-[11px] font-bold text-zinc-600 dark:text-zinc-300 border border-zinc-200/50 dark:border-zinc-800">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                            {language === 'sw' ? 'Umbali wa Ghala kuu:' : 'Warehouse Distance:'}
                          </span>
                          <span className="text-emerald-700 dark:text-emerald-400 font-black">
                            {deliveryDistanceKm} km
                          </span>
                        </div>
                      )}

                      {/* Manual text address */}
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                          {language === 'sw' ? 'Mahali / Anwani ya Mzigo upelekwe:' : 'Delivery Address / Location:'}
                        </label>
                        <input 
                          type="text" 
                          required
                          value={customerAddress}
                          onChange={(e) => setCustomerAddress(e.target.value)}
                          placeholder={language === 'sw' ? "Mf. Kariakoo, Dar es Salaam" : "e.g. Kariakoo, Dar es Salaam"}
                          className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-1 focus:ring-emerald-500 text-zinc-800 dark:text-white text-xs focus:outline-hidden"
                        />
                      </div>

                      {/* Courier selection */}
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                            {language === 'sw' ? 'Kampuni ya Usafiri:' : 'Courier Partner:'}
                          </label>
                          <select 
                            value={deliveryCompany}
                            onChange={(e) => setDeliveryCompany(e.target.value)}
                            className="w-full px-3.5 py-1.5 bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-700 rounded-xl text-[11px] text-zinc-800 dark:text-white font-bold focus:ring-1 focus:ring-emerald-500 focus:outline-hidden cursor-pointer"
                          >
                            <option value="Hurex Courier">{language === 'sw' ? 'Hurex Courier (Standard)' : 'Hurex Courier (Standard)'}</option>
                            <option value="BodaBoda Express">{language === 'sw' ? 'BodaBoda Haraka' : 'BodaBoda Express'}</option>
                            <option value="DHL Local">{language === 'sw' ? 'DHL Local Service' : 'DHL Local Service'}</option>
                            <option value="Faras Delivery">{language === 'sw' ? 'Faras Delivery' : 'Faras Delivery'}</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                            {language === 'sw' ? 'Kasi ya Usafirishaji:' : 'Delivery Speed:'}
                          </label>
                          <select 
                            value={deliverySpeed}
                            onChange={(e) => setDeliverySpeed(e.target.value as any)}
                            className="w-full px-3.5 py-1.5 bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-700 rounded-xl text-[11px] text-zinc-800 dark:text-white font-bold focus:ring-1 focus:ring-emerald-500 focus:outline-hidden cursor-pointer"
                          >
                            <option value="Standard">{language === 'sw' ? 'Kawaida (Masaa 3-6)' : 'Standard (3-6 hrs)'}</option>
                            <option value="Express">{language === 'sw' ? 'Haraka (Masaa 1-2)' : 'Express (1-2 hrs)'}</option>
                            <option value="Same-Day">{language === 'sw' ? 'Siku Hiyohiyo' : 'Same-Day'}</option>
                          </select>
                        </div>
                      </div>

                      {/* Display delivery charges */}
                      {deliveryFee > 0 && (
                        <div className="flex justify-between items-center bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/10 p-3 rounded-xl">
                          <div className="flex items-center gap-1.5">
                            <Truck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                            <div className="text-[10px]">
                              <p className="font-bold text-zinc-700 dark:text-zinc-200 leading-tight">
                                {language === 'sw' ? 'Gharama ya Usafiri' : 'Delivery Charges'}
                              </p>
                              <p className="text-[8px] text-zinc-400 font-bold leading-tight">
                                {language === 'sw' ? 'Kikokotoo Kiotomatiki' : 'Automated Pricing'}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                            + {formatMoney(deliveryFee)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                        {language === 'sw' ? 'Ujumbe au maelekezo ya ziada (Sio lazima):' : 'Additional note or instructions (Optional):'}
                      </label>
                      <textarea 
                        value={customerNote}
                        onChange={(e) => setCustomerNote(e.target.value)}
                        placeholder={language === 'sw' ? "Mf. Namba yangu ya simu mbadala au maelekezo maalum ya uwasilishaji..." : "e.g. Alternative phone number or special instructions..."}
                        rows={2}
                        className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-1 focus:ring-emerald-500 text-zinc-800 dark:text-white resize-none focus:outline-hidden"
                      />
                    </div>

                    {/* Store Payment Info Preview */}
                    <div className="bg-emerald-50/50 dark:bg-emerald-950/10 p-3.5 rounded-2xl border border-emerald-100 dark:border-emerald-900/20 space-y-2">
                      <span className="font-extrabold text-[10px] text-emerald-800 dark:text-emerald-400 uppercase block">
                        {language === 'sw' ? 'Kumbuka Kabla ya Kuagiza:' : 'Please Note Before Ordering:'}
                      </span>
                      <p className="text-[10px] text-emerald-700 dark:text-emerald-300 leading-relaxed">
                        {language === 'sw' 
                          ? 'Tafadhali fanya malipo kupitia namba zifuatazo (bofya namba kunakili), kisha weka risiti hapa chini na utume agizo.' 
                          : 'Please pay using the numbers below (click to copy), then attach the receipt below and submit your order.'}
                      </p>
                      <div className="space-y-1.5 max-h-40 overflow-y-auto scrollbar-thin pr-1 text-[10px]">
                        {lipaNambaMpesa && (
                          <div 
                            type="button"
                            onClick={() => handleCopy(lipaNambaMpesa, 'mpesa_lipa')}
                            className="flex justify-between items-center bg-white dark:bg-zinc-900 px-2.5 py-1.5 rounded-lg border border-zinc-150 dark:border-zinc-800/60 cursor-pointer hover:border-emerald-500 transition-all"
                            title={language === 'sw' ? "Gusa kunakili" : "Click to copy"}
                          >
                            <span>Lipa M-Pesa (Vodacom):</span>
                            <span className="font-mono font-black text-zinc-900 dark:text-white flex items-center gap-1">
                              {lipaNambaMpesa}
                              <Copy className="w-3 h-3 text-zinc-400" />
                              {isCopied === 'mpesa_lipa' && <span className="text-[9px] text-emerald-600 font-extrabold animate-pulse">Copied!</span>}
                            </span>
                          </div>
                        )}
                        {wakalaMpesa && (
                          <div 
                            type="button"
                            onClick={() => handleCopy(wakalaMpesa, 'mpesa_wakala')}
                            className="flex justify-between items-center bg-white dark:bg-zinc-900 px-2.5 py-1.5 rounded-lg border border-zinc-150 dark:border-zinc-800/60 cursor-pointer hover:border-emerald-500 transition-all"
                            title={language === 'sw' ? "Gusa kunakili" : "Click to copy"}
                          >
                            <span>{language === 'sw' ? 'M-Pesa (Wakala Code):' : 'M-Pesa (Agent Code):'}</span>
                            <span className="font-mono font-black text-zinc-900 dark:text-white flex items-center gap-1">
                              {wakalaMpesa}
                              <Copy className="w-3 h-3 text-zinc-400" />
                              {isCopied === 'mpesa_wakala' && <span className="text-[9px] text-emerald-600 font-extrabold animate-pulse">Copied!</span>}
                            </span>
                          </div>
                        )}
                        {lipaNambaTigo && (
                          <div 
                            type="button"
                            onClick={() => handleCopy(lipaNambaTigo, 'tigo_lipa')}
                            className="flex justify-between items-center bg-white dark:bg-zinc-900 px-2.5 py-1.5 rounded-lg border border-zinc-150 dark:border-zinc-800/60 cursor-pointer hover:border-emerald-500 transition-all"
                            title={language === 'sw' ? "Gusa kunakili" : "Click to copy"}
                          >
                            <span>Lipa Tigo Pesa:</span>
                            <span className="font-mono font-black text-zinc-900 dark:text-white flex items-center gap-1">
                              {lipaNambaTigo}
                              <Copy className="w-3 h-3 text-zinc-400" />
                              {isCopied === 'tigo_lipa' && <span className="text-[9px] text-emerald-600 font-extrabold animate-pulse">Copied!</span>}
                            </span>
                          </div>
                        )}
                        {wakalaTigo && (
                          <div 
                            type="button"
                            onClick={() => handleCopy(wakalaTigo, 'tigo_wakala')}
                            className="flex justify-between items-center bg-white dark:bg-zinc-900 px-2.5 py-1.5 rounded-lg border border-zinc-150 dark:border-zinc-800/60 cursor-pointer hover:border-emerald-500 transition-all"
                            title={language === 'sw' ? "Gusa kunakili" : "Click to copy"}
                          >
                            <span>{language === 'sw' ? 'Tigo (Wakala Code):' : 'Tigo (Agent Code):'}</span>
                            <span className="font-mono font-black text-zinc-900 dark:text-white flex items-center gap-1">
                              {wakalaTigo}
                              <Copy className="w-3 h-3 text-zinc-400" />
                              {isCopied === 'tigo_wakala' && <span className="text-[9px] text-emerald-600 font-extrabold animate-pulse">Copied!</span>}
                            </span>
                          </div>
                        )}
                        {lipaNambaAirtel && (
                          <div 
                            type="button"
                            onClick={() => handleCopy(lipaNambaAirtel, 'airtel_lipa')}
                            className="flex justify-between items-center bg-white dark:bg-zinc-900 px-2.5 py-1.5 rounded-lg border border-zinc-150 dark:border-zinc-800/60 cursor-pointer hover:border-emerald-500 transition-all"
                            title={language === 'sw' ? "Gusa kunakili" : "Click to copy"}
                          >
                            <span>Lipa Airtel Money:</span>
                            <span className="font-mono font-black text-zinc-900 dark:text-white flex items-center gap-1">
                              {lipaNambaAirtel}
                              <Copy className="w-3 h-3 text-zinc-400" />
                              {isCopied === 'airtel_lipa' && <span className="text-[9px] text-emerald-600 font-extrabold animate-pulse">Copied!</span>}
                            </span>
                          </div>
                        )}
                        {wakalaAirtel && (
                          <div 
                            type="button"
                            onClick={() => handleCopy(wakalaAirtel, 'airtel_wakala')}
                            className="flex justify-between items-center bg-white dark:bg-zinc-900 px-2.5 py-1.5 rounded-lg border border-zinc-150 dark:border-zinc-800/60 cursor-pointer hover:border-emerald-500 transition-all"
                            title={language === 'sw' ? "Gusa kunakili" : "Click to copy"}
                          >
                            <span>{language === 'sw' ? 'Airtel (Wakala Code):' : 'Airtel (Agent Code):'}</span>
                            <span className="font-mono font-black text-zinc-900 dark:text-white flex items-center gap-1">
                              {wakalaAirtel}
                              <Copy className="w-3 h-3 text-zinc-400" />
                              {isCopied === 'airtel_wakala' && <span className="text-[9px] text-emerald-600 font-extrabold animate-pulse">Copied!</span>}
                            </span>
                          </div>
                        )}
                        {lipaNambaHalopesa && (
                          <div 
                            type="button"
                            onClick={() => handleCopy(lipaNambaHalopesa, 'halopesa_lipa')}
                            className="flex justify-between items-center bg-white dark:bg-zinc-900 px-2.5 py-1.5 rounded-lg border border-zinc-150 dark:border-zinc-800/60 cursor-pointer hover:border-emerald-500 transition-all"
                            title={language === 'sw' ? "Gusa kunakili" : "Click to copy"}
                          >
                            <span>Lipa HaloPesa:</span>
                            <span className="font-mono font-black text-zinc-900 dark:text-white flex items-center gap-1">
                              {lipaNambaHalopesa}
                              <Copy className="w-3 h-3 text-zinc-400" />
                              {isCopied === 'halopesa_lipa' && <span className="text-[9px] text-emerald-600 font-extrabold animate-pulse">Copied!</span>}
                            </span>
                          </div>
                        )}
                        {wakalaHalopesa && (
                          <div 
                            type="button"
                            onClick={() => handleCopy(wakalaHalopesa, 'halopesa_wakala')}
                            className="flex justify-between items-center bg-white dark:bg-zinc-900 px-2.5 py-1.5 rounded-lg border border-zinc-150 dark:border-zinc-800/60 cursor-pointer hover:border-emerald-500 transition-all"
                            title={language === 'sw' ? "Gusa kunakili" : "Click to copy"}
                          >
                            <span>{language === 'sw' ? 'Halotel (Wakala Code):' : 'Halotel (Agent Code):'}</span>
                            <span className="font-mono font-black text-zinc-900 dark:text-white flex items-center gap-1">
                              {wakalaHalopesa}
                              <Copy className="w-3 h-3 text-zinc-400" />
                              {isCopied === 'halopesa_wakala' && <span className="text-[9px] text-emerald-600 font-extrabold animate-pulse">Copied!</span>}
                            </span>
                          </div>
                        )}
                        {lipaNambaAzampesa && (
                          <div 
                            type="button"
                            onClick={() => handleCopy(lipaNambaAzampesa, 'azampesa_lipa')}
                            className="flex justify-between items-center bg-white dark:bg-zinc-900 px-2.5 py-1.5 rounded-lg border border-zinc-150 dark:border-zinc-800/60 cursor-pointer hover:border-emerald-500 transition-all"
                            title={language === 'sw' ? "Gusa kunakili" : "Click to copy"}
                          >
                            <span>Lipa Azam Pesa:</span>
                            <span className="font-mono font-black text-zinc-900 dark:text-white flex items-center gap-1">
                              {lipaNambaAzampesa}
                              <Copy className="w-3 h-3 text-zinc-400" />
                              {isCopied === 'azampesa_lipa' && <span className="text-[9px] text-emerald-600 font-extrabold animate-pulse">Copied!</span>}
                            </span>
                          </div>
                        )}
                        {bankAccountInfo && (
                          <div 
                            type="button"
                            onClick={() => handleCopy(bankAccountInfo, 'bank_info')}
                            className="bg-white dark:bg-zinc-900 p-2 rounded-lg border border-zinc-150 dark:border-zinc-800/60 cursor-pointer hover:border-emerald-500 transition-all space-y-0.5"
                            title={language === 'sw' ? "Gusa kunakili" : "Click to copy"}
                          >
                            <span className="font-extrabold block text-[9px] text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                              {language === 'sw' ? 'Akaunti ya Benki:' : 'Bank Account Info:'}
                              <Copy className="w-3 h-3 text-zinc-400" />
                            </span>
                            <span className="font-mono font-black text-zinc-800 dark:text-zinc-200 block break-all">
                              {bankAccountInfo}
                            </span>
                            {isCopied === 'bank_info' && <span className="text-[9px] text-emerald-600 font-extrabold animate-pulse block text-right">Copied!</span>}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Payment Receipt Upload */}
                    <div className="bg-emerald-500/[0.04] dark:bg-emerald-950/[0.15] p-3.5 rounded-2xl border border-emerald-100/50 dark:border-emerald-900/20 space-y-2.5">
                      <label className="block text-[10px] font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
                        {language === 'sw' ? 'Pakia Picha ya Risiti ya Malipo (Payment Receipt):' : 'Upload Payment Receipt Image:'}
                      </label>
                      <p className="text-[10px] text-zinc-500 leading-normal">
                        {language === 'sw' 
                          ? 'Baada ya kulipia kupitia namba za hapo juu, pakia hapa picha ya muamala/risiti ili iandaliwe kiotomatiki:' 
                          : 'After paying with the options above, upload the receipt photo/screenshot here for automatic recognition:'}
                      </p>
                      
                      <div className="space-y-2">
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setPaymentReceiptImage(reader.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="w-full text-[11px] text-zinc-500 file:mr-2.5 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
                        />
                        
                        {paymentReceiptImage ? (
                          <div className="relative mt-2 p-2 bg-white dark:bg-zinc-900 rounded-xl border border-emerald-100 dark:border-emerald-850 flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 shrink-0">
                              <img src={paymentReceiptImage} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt="Risiti ya Malipo" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-[10px] text-emerald-600 font-bold block">
                                {language === 'sw' ? 'Risiti Imepakiwa vizuri!' : 'Receipt uploaded successfully!'}
                              </span>
                              <span className="text-[9px] text-zinc-400 block truncate">
                                {language === 'sw' ? 'Kamilisha agizo hapa chini' : 'Complete order below'}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setPaymentReceiptImage('')}
                              className="text-red-500 hover:text-red-700 font-bold text-xs px-2 py-1 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg shrink-0 cursor-pointer"
                            >
                              {language === 'sw' ? 'Ondoa' : 'Remove'}
                            </button>
                          </div>
                        ) : (
                          <div className="p-2.5 bg-amber-500/[0.04] rounded-xl border border-amber-200/40 text-[10px] text-amber-600 font-medium leading-relaxed">
                            {language === 'sw' 
                              ? '⚠️ Haujaweka bado risiti ya picha. Unaweza kupakia sasa ili kumuonyesha muuzaji moja kwa moja.' 
                              : '⚠️ No receipt screenshot uploaded yet. You can upload one now to show the seller.'}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Grand Total */}
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-850 rounded-2xl border border-zinc-200/40 dark:border-zinc-800/40 space-y-1.5">
                      <div className="flex justify-between items-center text-[11px] text-zinc-500 dark:text-zinc-400">
                        <span>{language === 'sw' ? 'Jumla Ndogo (Subtotal):' : 'Subtotal:'}</span>
                        <span className="font-bold">{formatMoney(totalCartAmount)}</span>
                      </div>
                      {appliedPromoCode && (
                        <div className="flex justify-between items-center text-[11px] text-rose-500 font-bold">
                          <span>{language === 'sw' ? `Msimbo wa Punguzo (${appliedPromoCode} -${promoDiscountPercent}%):` : `Promo Discount (${appliedPromoCode} -${promoDiscountPercent}%):`}</span>
                          <span>-{formatMoney(Math.round(totalCartAmount * (promoDiscountPercent / 100)))}</span>
                        </div>
                      )}
                      {deliveryFee > 0 && (
                        <div className="flex justify-between items-center text-[11px] text-zinc-500 dark:text-zinc-400">
                          <span>{language === 'sw' ? 'Gharama ya Usafirishaji:' : 'Delivery Fee:'}</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">+{formatMoney(deliveryFee)}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center border-t border-zinc-200 dark:border-zinc-800 pt-1.5">
                        <span className="font-black text-xs text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                          {language === 'sw' ? 'Jumla Kuu ya Kikapu:' : 'Grand Total:'}
                        </span>
                        <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                          {formatMoney(totalCartAmount - Math.round(totalCartAmount * (promoDiscountPercent / 100)) + deliveryFee)}
                        </span>
                      </div>
                    </div>

                    {/* Submit Order Buttons */}
                    <button
                      type="submit"
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer"
                    >
                      <MessageCircle className="w-5 h-5 text-white" />
                      {language === 'sw' ? 'Tuma Agizo & Lipia WhatsApp sasa' : 'Send Order & Checkout on WhatsApp'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Hurex AI Sales Assistant */}
      <div className="fixed bottom-4 right-4 z-40 sm:bottom-6 sm:right-6">
        {/* Toggle Button */}
        <button
          onClick={() => setIsAiOpen(!isAiOpen)}
          className="flex items-center gap-2 p-3.5 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white rounded-full shadow-2xl transition-all scale-100 hover:scale-105 active:scale-95 cursor-pointer group"
          id="hurex-ai-chat-bubble"
        >
          <Sparkles className="w-5 h-5 animate-pulse" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-28 transition-all duration-300 text-[11px] font-black tracking-wide uppercase whitespace-nowrap">
            {language === 'sw' ? 'Hurex AI' : 'Hurex AI'}
          </span>
          <span className="relative flex h-2 w-2 -mt-3.5 -mr-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
        </button>

        {/* AI Sheet Panel */}
        {isAiOpen && (
          <div 
            className="w-80 sm:w-96 h-[450px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-3xl flex flex-col overflow-hidden fixed bottom-18 right-4 z-50 sm:right-6 transition-all animate-in slide-in-from-bottom duration-250"
            id="hurex-ai-chat-sheet"
          >
            {/* Header */}
            <div className="bg-emerald-600 dark:bg-emerald-750 px-4 py-3 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4.5 h-4.5 animate-bounce" />
                <div>
                  <h4 className="font-black text-xs uppercase tracking-wider leading-tight">Hurex AI Assistant</h4>
                  <span className="text-[9px] text-emerald-100 font-medium">
                    {language === 'sw' ? 'Msaidizi wako wa Mauzo' : 'Smart Retail Concierge'}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setIsAiOpen(false)}
                className="p-1 hover:bg-emerald-700/50 rounded-lg text-white font-black text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-50/50 dark:bg-zinc-950/20 text-xs">
              {aiMessages.map((msg, i) => (
                <div 
                  key={i} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-xs leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-emerald-600 text-white rounded-br-none' 
                      : 'bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200/50 dark:border-zinc-750 rounded-bl-none'
                  }`}>
                    {msg.text.split('\n').map((line, idx) => (
                      <p key={idx} className={idx > 0 ? 'mt-1' : ''}>{line}</p>
                    ))}
                  </div>
                </div>
              ))}
              {isAiLoading && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-zinc-800 text-zinc-400 border border-zinc-250/30 rounded-2xl px-4 py-3 flex items-center gap-1.5 rounded-bl-none shrink-0 shadow-xs">
                    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0 flex gap-2">
              <input
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendAiMessage();
                }}
                placeholder={language === 'sw' ? 'Uliza lolote...' : 'Ask about products, deliveries...'}
                className="flex-1 px-3 py-2 bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden text-zinc-800 dark:text-white"
              />
              <button
                onClick={handleSendAiMessage}
                disabled={!aiInput.trim() || isAiLoading}
                className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

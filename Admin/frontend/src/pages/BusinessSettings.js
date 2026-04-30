import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config/api";
import ShippingSettings from "../components/ShippingSettings";
import InvoiceSettings from "../components/InvoiceSettings";
import CustomerSettings from "../components/CustomerSettings";
import DeliveryRestrictionSettings from "../components/DeliveryRestrictionSettings";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Tooltip,
  IconButton,
} from "@mui/material";
import {
  Save as SaveIcon,
  Info as InfoIcon,
  Business as BusinessIcon,
  AttachMoney as CurrencyIcon,
  GetApp as AppIcon,
  Apple as AppleIcon,
  Android as AndroidIcon,
  Palette as PaletteIcon,
  Image as ImageIcon,
} from "@mui/icons-material";

// Import separate component files
import GeneralSettings from "../components/GeneralSettings";
import PaymentOptions from "../components/PaymentOptions";
import OrderSettings from "../components/OrderSettings";
import VendorSettings from "../components/VendorSettings";

const BusinessSettings = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [maintenanceDialogOpen, setMaintenanceDialogOpen] = useState(false);
  const [digitalProductDialogOpen, setDigitalProductDialogOpen] =
    useState(false);
  const [form, setForm] = useState({
    // System Maintenance
    maintenanceMode: false,

    // Company Information
    companyName: "APNADECORATION",
    companyPhone: "+91 94092 74081",
    companyEmail: "officialapnadecoration@gmail.com",
    country: "India",
    timezone: "UTC",
    language: "English (En)",
    companyAddress: "12, Patel park, Tadwadi, Adajan, Surat, 9409274081",
    latitude: "21.1702",
    longitude: "72.8311",

    // Business Information
    currency: "INR",
    currencyPosition: "left",
    businessModel: "single",
    pagination: 10,
    copyrightText: "Copy Right APNADECORATION@2025",
    decimalPrecision: 2,
    sellDigitalProduct: false,

    // App Download Info
    showAppStore: true,
    appStoreUrl:
      "https://www.target.com/s/apple+store++now?ref=tgt_adv_XS000000&AFID=msn&fndsrc=tgtao&DFA=71700000012505188&CPNG=Electronics_Portable+Computers&adgroup=Portable+Computers&LID=700000001176246&LNM=apple+store+near+me+now&MT=b&network=s&device=c&location=12&targetid=kwd-81913773633608:loc-12&ds_rl=1246978&ds_rl=1248099&gclsrc=ds",
    showPlayStore: true,
    playStoreUrl: "https://play.google.com/store?hl=en_US&gl=US",

    // Website Colors
    primaryColor: "#1B7FED",
    secondaryColor: "#000000",

    // Logo & Branding
    headerLogo: "",
    footerLogo: "",
    favicon: "",
    loadingGif: "",
    appLogo: "",

    // Priority Setup
    brandSortingType: "default",
    brandCustomSortMethod: "latest_created",
    categorySortingType: "default",
    categoryCustomSortMethod: "latest_created",
    vendorListSortingType: "default",
    vendorListCustomSortMethod: "latest_created",
    vendorListClosedStoreHandling: "show_last",
    vendorListTemporarilyOffHandling: "show_last",
    featuredProductsSortingType: "default",
    featuredProductsCustomSortMethod: "latest_created",
    featuredProductsStockOutHandling: "show_last",
    featuredProductsStoreStatusHandling: "show_last",
    newArrivalProductsSortingType: "default",
    newArrivalProductsCustomSortMethod: "latest_created",
    newArrivalProductsDuration: 1,
    newArrivalProductsDurationType: "days",
    newArrivalProductsStockOutHandling: "show_last",
    newArrivalProductsStoreStatusHandling: "show_last",
    topVendorSortingType: "default",
    topVendorCustomSortMethod: "latest_created",
    topVendorRatingFilter: "4_plus",
    topVendorClosedStoreHandling: "show_last",
    topVendorTemporarilyOffHandling: "show_last",
    categoryWiseProductSortingType: "default",
    categoryWiseProductCustomSortMethod: "latest_created",
    categoryWiseProductStockOutHandling: "show_last",
    categoryWiseProductStoreStatusHandling: "show_last",
    topRatedProductsSortingType: "default",
    topRatedProductsCustomSortMethod: "latest_created",
    topRatedProductsRatingFilter: "4_plus",
    topRatedProductsStockOutHandling: "show_last",
    topRatedProductsStoreStatusHandling: "show_last",
    bestSellingProductsSortingType: "default",
    bestSellingProductsCustomSortMethod: "latest_created",
    bestSellingProductsStockOutHandling: "show_last",
    bestSellingProductsStoreStatusHandling: "show_last",
    productsListSearchSortingType: "default",
    productsListSearchCustomSortMethod: "latest_created",
    productsListSearchStockOutHandling: "show_last",
    productsListSearchStoreStatusHandling: "show_last",
    vendorProductListSortingType: "default",
    vendorProductListCustomSortMethod: "latest_created",
    vendorProductListStockOutHandling: "show_last",

    // Orders
    orderDeliveryVerification: true,
    minimumOrderAmount: 0,
    showBillingAddressInCheckout: true,
    freeDelivery: true,
    freeDeliveryResponsibility: "admin",
    freeDeliveryOverAmount: 500,
    refundOrderValidityDays: 1,
    guestCheckout: true,
  });

  const [paymentMethods, setPaymentMethods] = useState({
    cashOnDelivery: true,
    digitalPayment: true,
    offlinePayment: false,
  });

  const [orderSettings, setOrderSettings] = useState({
    orderDeliveryVerification: false,
    minimumOrderEnabled: true,
    minimumOrderAmount: 0,
    showBillingAddress: true,
    freeDeliveryEnabled: false,
    freeDeliveryResponsibility: "admin",
    freeDeliveryOverAmount: 0,
    refundOrderValidityDays: 7,
    guestCheckoutEnabled: false,
  });

  const fetchBusinessSettings = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/admin-settings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const settings = response.data;
      if (settings) {
        setForm((prev) => ({ ...prev, ...settings }));
        setPaymentMethods(
          settings.paymentMethods || {
            cashOnDelivery: true,
            digitalPayment: true,
            offlinePayment: false,
          },
        );
        setOrderSettings(
          settings.orderSettings || {
            orderDeliveryVerification: false,
            minimumOrderEnabled: true,
            minimumOrderAmount: 0,
            showBillingAddress: true,
            freeDeliveryEnabled: false,
            freeDeliveryResponsibility: "admin",
            freeDeliveryOverAmount: 0,
            refundOrderValidityDays: 7,
            guestCheckoutEnabled: false,
          },
        );
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching business settings:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/admin-settings`, auth())
      .then((res) => setForm((prev) => ({ ...prev, ...res.data })))
      .catch(console.error);
  }, []);

  const auth = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  const onChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") setForm({ ...form, [name]: checked });
    else if (type === "file") setForm({ ...form, [name]: files[0] });
    else setForm({ ...form, [name]: value });
  };

  const onSave = async () => {
    try {
      setLoading(true);
      const fd = new FormData();
      Object.keys(form).forEach(
        (k) => form[k] !== null && fd.append(k, form[k]),
      );
      await axios.post(`${API_BASE_URL}/admin/settings`, fd, auth());
      alert("Settings saved successfully");
    } catch (e) {
      alert("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field) => (event) => {
    setForm((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handlePaymentMethodChange = (method, value) => {
    setPaymentMethods((prev) => ({
      ...prev,
      [method]: value,
    }));
  };

  const handleOrderSettingChange = (key, value) => {
    setOrderSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");

      const updateData = {
        ...form,
        paymentMethods,
        orderSettings,
      };

      const response = await axios.put(
        `${API_BASE_URL}/admin/settings`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("Business settings saved:", response.data);
      alert("Business settings saved successfully");
    } catch (error) {
      console.error("Error saving business settings:", error);
      alert("Error saving business settings");
    }
  };

  useEffect(() => {
    fetchBusinessSettings();
  }, []);

  if (loading) {
    return (
      <Box sx={{ p: 3, display: "flex", justifyContent: "center" }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        Business Settings
      </Typography>

      <Card sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(event, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab label="General" />
          <Tab label="Payment Options" />
          <Tab label="Orders" />
          <Tab label="Vendors" />
          <Tab label="Customers" />
          <Tab label="Shipping Method" />
          <Tab label="Delivery Restriction" />
          <Tab label="Invoice" />
        </Tabs>

        <Box sx={{ mt: 3 }}>
          {activeTab === 0 && <GeneralSettings />}

          {activeTab === 1 && <PaymentOptions />}

          {activeTab === 2 && <OrderSettings />}

          {activeTab === 3 && <VendorSettings />}

          {activeTab === 4 && <CustomerSettings />}

          {activeTab === 5 && <ShippingSettings />}

          {activeTab === 6 && <DeliveryRestrictionSettings />}

          {activeTab === 7 && <InvoiceSettings />}
        </Box>
      </Card>
    </Box>
  );
};

export default BusinessSettings;

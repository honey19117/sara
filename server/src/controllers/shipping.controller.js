import { get } from '../config/db.js';

export const calculateShipping = async (req, res, next) => {
  try {
    const { pincode, subtotal = 0, shippingMethod = 'standard' } = req.body;

    if (!pincode || !/^\d{6}$/.test(pincode.toString().trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 6-digit Indian postal PIN code.'
      });
    }

    const freeShippingSetting = await get("SELECT value FROM settings WHERE key = 'free_shipping_threshold'");
    const standardRateSetting = await get("SELECT value FROM settings WHERE key = 'standard_shipping_charge'");
    const expressRateSetting = await get("SELECT value FROM settings WHERE key = 'express_shipping_charge'");

    const freeThreshold = freeShippingSetting ? parseFloat(freeShippingSetting.value) : 2499;
    let standardRate = standardRateSetting ? parseFloat(standardRateSetting.value) : 99;
    let expressRate = expressRateSetting ? parseFloat(expressRateSetting.value) : 199;

    const cartSubtotal = parseFloat(subtotal) || 0;
    const qualifiesForFreeStandard = cartSubtotal >= freeThreshold;

    let selectedRate = 0;
    let standardCharge = qualifiesForFreeStandard ? 0 : standardRate;
    let expressCharge = expressRate;

    if (shippingMethod === 'express') {
      selectedRate = expressCharge;
    } else {
      selectedRate = standardCharge;
    }

    const now = new Date();
    const standardDateMin = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const standardDateMax = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
    const expressDate = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

    const formatDate = (d) => d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });

    res.json({
      success: true,
      pincode: pincode.toString().trim(),
      shippingMethod,
      shippingCharge: selectedRate,
      freeShippingThreshold: freeThreshold,
      qualifiesForFreeStandard,
      options: [
        {
          id: 'standard',
          name: 'Standard Secure Ground Delivery',
          price: standardCharge,
          originalPrice: standardRate,
          isFree: qualifiesForFreeStandard,
          estimatedDelivery: `${formatDate(standardDateMin)} - ${formatDate(standardDateMax)}`,
          carrier: 'Blue Dart / Delhivery Express'
        },
        {
          id: 'express',
          name: 'Priority White-Glove Air Express',
          price: expressCharge,
          originalPrice: expressRate,
          isFree: false,
          estimatedDelivery: `${formatDate(expressDate)} (Next 48 Hours)`,
          carrier: 'AURA Priority Air'
        }
      ]
    });
  } catch (error) {
    next(error);
  }
};

export const validatePincode = async (req, res, next) => {
  try {
    const { pincode } = req.params;
    if (!pincode || !/^\d{6}$/.test(pincode.trim())) {
      return res.status(400).json({ success: false, message: 'Invalid 6-digit PIN code.' });
    }

    res.json({
      success: true,
      serviceable: true,
      pincode: pincode.trim(),
      message: 'Serviceable for standard and express luxury delivery.'
    });
  } catch (error) {
    next(error);
  }
};

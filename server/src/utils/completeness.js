// Profile completeness score per the AFRIMOS spec:
// company name 10%, contact info 10%, address 10%, description 10%,
// certifications 10%, logo 10%, at least one product 20%, shipping terms 10%.
// The remaining 10% is granted for a website or registration number.
export function profileCompleteness(profile, productCount) {
  let score = 0;
  if (profile.companyName) score += 10;
  if (profile.phone) score += 10;
  if (profile.address && profile.city) score += 10;
  if (profile.description && profile.description.length >= 30) score += 10;
  if (profile.certifications?.length) score += 10;
  if (profile.logoBanner) score += 10;
  if (productCount > 0) score += 20;
  if (profile.shippingTerms) score += 10;
  if (profile.website || profile.registrationNumber) score += 10;
  return score;
}

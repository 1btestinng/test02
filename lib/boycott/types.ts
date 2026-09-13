export type BoycottCategory =
  | 'food' | 'beverages' | 'grocery' | 'fashion' | 'beauty' | 'household' | 'baby'
  | 'technology' | 'software' | 'finance' | 'travel' | 'automotive' | 'energy'
  | 'media' | 'healthcare' | 'industrial' | 'construction' | 'agriculture'
  | 'logistics' | 'retail' | 'other';

export type BoycottVisibility = 'very-high' | 'high' | 'medium' | 'low';

export type BoycottEntry = {
  id: string;
  rank: number;
  company: string;
  product: string;
  reason: string;
  category?: BoycottCategory;
  subcategory?: string;
  aliases?: string[];
  logo?: string;
  country?: string;
  description?: string;
  status?: string;
  source?: string;
  sourceUrl?: string;
  date?: string;
  confidence?: 'high' | 'medium' | 'low';
  campaignType?: string;
  visibility?: BoycottVisibility;
  visibilityScore?: number;
};

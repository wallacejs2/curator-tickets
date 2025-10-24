

import { Status, Priority, TicketType, ProductArea, Platform, DealershipStatus, FeatureStatus, ContactType, ReleaseStatus, Product } from './types.ts';

export const STATUS_OPTIONS = [
  Status.NotStarted,
  Status.InProgress,
  Status.InReview,
  Status.DevReview,
  Status.PmdReview,
  Status.OnHold,
  Status.Testing,
  Status.Completed,
];
export const PRIORITY_OPTIONS = Object.values(Priority);
export const TICKET_TYPE_OPTIONS = Object.values(TicketType);
export const PRODUCT_AREA_OPTIONS = Object.values(ProductArea);
export const PLATFORM_OPTIONS = Object.values(Platform);
export const DEALERSHIP_STATUS_OPTIONS = Object.values(DealershipStatus);
export const FEATURE_STATUS_OPTIONS = Object.values(FeatureStatus);
export const CONTACT_TYPE_OPTIONS = Object.values(ContactType);
// FIX: Added missing RELEASE_STATUS_OPTIONS constant.
export const RELEASE_STATUS_OPTIONS = Object.values(ReleaseStatus);


export const ISSUE_PRIORITY_OPTIONS = [Priority.P1, Priority.P2, Priority.P3, Priority.P4];
export const FEATURE_REQUEST_PRIORITY_OPTIONS = [Priority.P1, Priority.P2, Priority.P3, Priority.P4];

export const PRODUCTS: Product[] = [
  // Old
  { id: '15381', name: 'Curator - Audience Activation', fixedPrice: 4995, category: 'Old' },
  { id: '15382', name: 'Curator - SE', fixedPrice: 8275, category: 'Old' },
  { id: '15390', name: 'Curator - Text Campaigns', fixedPrice: 795, category: 'Old' },
  // New
  { id: '15391', name: 'Curator - SE', fixedPrice: 6500, category: 'New' },
  { id: '15392', name: 'Curator Managed', fixedPrice: 1750, category: 'New' },
  { id: '15435', name: 'Curator - Additional Website', fixedPrice: 799, category: 'New' },
  { id: '15436', name: 'Curated Managed - Additional Website', fixedPrice: 799, category: 'New' },
  { id: '19588', name: 'Enhanced Customer Data', fixedPrice: 0, category: 'New' },
];

export const REYNOLDS_SOLUTIONS = ['XTS', 'MMS', 'TRU', 'ADVSVC'];
export const FULLPATH_SOLUTIONS = ['DigAds', 'VIN', 'WEB-ENGAGE', 'DYN PMTS'];

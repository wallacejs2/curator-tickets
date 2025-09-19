import { Status, Priority, TicketType, ProductArea, Platform, DealershipStatus, FeatureStatus, ContactType } from './types.ts';

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


export const ISSUE_PRIORITY_OPTIONS = [Priority.P1, Priority.P2, Priority.P3, Priority.P4];
export const FEATURE_REQUEST_PRIORITY_OPTIONS = [Priority.P1, Priority.P2, Priority.P3, Priority.P4];
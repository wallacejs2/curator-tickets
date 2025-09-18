// This hook has been removed as toast notifications are no longer used.
export function useToast() {
  return {
    toast: { message: '', type: 'success', isVisible: false },
    showToast: () => {},
    hideToast: () => {},
  };
}

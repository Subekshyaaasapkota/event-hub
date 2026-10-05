// Stand-in for react-hot-toast when rendering pages in Node.
//
// react-hot-toast pulls in goober, which reads the DOM at import time and
// throws in Node. 23 files import it, so a single unresolvable import made 22
// of the 31 pages look broken when they were never actually loaded.
//
// Only the toast surface is replaced. The page's own logic, hooks and render
// path all still execute, which is the entire point of the check. A real toast
// appearing or not is not something this harness can observe either way.

const noop = () => {};
const toast = () => {};

toast.success = noop;
toast.error = noop;
toast.loading = noop;
toast.custom = noop;
toast.dismiss = noop;
toast.remove = noop;
toast.promise = noop;
toast.isLoading = noop;

export { toast };
export const Toaster = () => null;
export const useToast = () => ({ toast });
export default { toast, Toaster, useToast };

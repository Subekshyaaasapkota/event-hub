// Stand-in for leaflet when rendering pages in Node.
//
// leaflet reads deviceXDPI off document.documentElement while its Browser
// module is initialising, which throws in Node. MapPicker touches L.Icon.Default
// at module scope, so a bare import failure takes the whole page down before
// any markup exists.
//
// Aliasing must be exact: "leaflet" as a prefix would also capture
// "leaflet/dist/leaflet.css" and break that import.

const chainable = () => {
  const fn = () => chainable();
  return new Proxy(fn, {
    get: (target, prop) => {
      if (prop === Symbol.toPrimitive || prop === "then") return undefined;
      if (prop === "prototype") return {};
      return chainable();
    },
    set: () => true,
    apply: () => chainable(),
  });
};

const IconDefault = {
  prototype: { _getIconUrl: () => "" },
  mergeOptions: () => {},
  Default: undefined,
};
IconDefault.Default = IconDefault;

const L = {
  Icon: { Default: IconDefault },
  map: chainable(),
  tileLayer: () => chainable(),
  marker: () => chainable(),
  divIcon: () => chainable(),
  icon: () => chainable(),
  latLng: () => chainable(),
  latLngBounds: () => chainable(),
  point: () => chainable(),
  control: { zoom: () => chainable(), attribution: () => chainable() },
  DomUtil: { create: () => chainable(), get: () => chainable() },
};

// react-leaflet imports these by name rather than off the default export, so
// they have to exist as real named exports or the page fails to load. Each one
// is a component that never mounts under renderToString, so a chainable stand
// in is enough.
export const Map = chainable();
export const TileLayer = chainable();
export const Marker = chainable();
export const Popup = chainable();
export const Tooltip = chainable();
export const Circle = chainable();
export const CircleMarker = chainable();
export const Polygon = chainable();
export const Polyline = chainable();
export const Rectangle = chainable();
export const FeatureGroup = chainable();
export const LayerGroup = chainable();
export const GeoJSON = chainable();
export const ImageOverlay = chainable();
export const SVGOverlay = chainable();
export const VideoOverlay = chainable();
export const Control = chainable();
export const DomUtil = L.DomUtil;
export const LatLngBounds = chainable();
export const LatLng = chainable();

export default L;
export { L };

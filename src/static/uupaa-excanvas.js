/** uupaa-excanvas.js
 *
 * uupaa-excanvas.js is HTML5::Canvas support javascript library
 *  - uupaa.js spin-off project
 *
 * @author Takao Obara <uupaa.js@gmail.com>
 * @license Dual licensed under the MIT and
 *            Apache(Apache License, Version 2.0) licenses.
 * @version 0.40 beta
 * @date 2009-05-23
 */
(function() {
var uu, uuCanvas,
    _doc = document, _win = window, _ie = !!_doc.uniqueID,
    _int = parseInt, _float = parseFloat,
    _math = Math, _round = _math.round, _ceil = _math.ceil,
    _sin = _math.sin, _cos = _math.cos, _max = _math.max, _min = _math.min,
    _toDegrees = 180 / _math.PI; // Math.toDegrees

// === uupaa.js binary =====================================
_win.uu||(function(navi,txt){
var nu=navi.userAgent,np=navi.plugins;
_win.uu=uu={};
uu.mix||(uu.mix=function(b,f,a,o){o=(o===void 0)||o;
  for(var i in f){if(o||!(i in b)){b[i]=f[i];}}return a?uu.mix(b,a,0,o):b;});
uu.mix(uu,{
  style:function(e){return _ie?(e.currentStyle||e.style):
    _doc.defaultView.getComputedStyle(e,"");},
  hex:(function(z){var r=[],i=0,j;for(;i<z;++i){for(j=0;j<z;++j){
    r[i*z+j]=i.toString(z)+j.toString(z);}}return r;})(16),
  bind:function(e,n,f,c){_ie?e.attachEvent("on"+n,f):
    e.addEventListener(n,f,c||false);},
  unbind:function(e,n,f,c){_ie?e.detachEvent("on"+n,f):
    e.removeEventListener(n,f,c||false);},
  stop:function(e){e=e||_win.event;
    _ie?(e.cancelBubble=true):e.stopPropagation();
    _ie?(e.returnValue=false):e.preventDefault();},
  ua:{}
},0,0);
uu.mix(uu.ua,{
  ie:_ie,
  opera:!!_win.opera,
  gecko:nu.indexOf("Gecko/")>0,
  webkit:nu.indexOf("WebKit")>0,
  chrome:nu.indexOf("Chrome")>0,
  ieMode8:_ie&&_doc.documentMode>=8,
  ver:_float((/(?:IE |fox\/|ome\/|ion\/|era\/)(\d+\.\d+)/.exec(nu)||[,0])[1]),
  ag:(function(){try{var a=["1.0","2.0","3.0"],i=3,o=_ie?
    new ActiveXObject("AgControl.AgControl"):np["Silverlight Plug-In"];
    while(i--){if(_ie?o.IsVersionSupported(a[i]):_float(o.description.match(
    /\d+\.\d+/)[0])>=_float(a[i])){return _float(a[i]);}}
    }catch(x){}return 0;})()
},0,0);
uu[txt]=uu.ua.gecko?"textContent":txt;
})(navigator,"innerText");

// === uuCanvas ============================================
_win.uuCanvas = uuCanvas = {
  // uuCanvas.init - initialize a canvas made dynamically
  init: function(canvas, // @param Node: canvas element
                 vml) {  // @param Boolean(= false): true = force VML
    return canvas.getContext ? canvas // already initialized
                             : (vml || !uu.ua.ag) ? uuCanvas.VMLInit(canvas)
                                                  : uuCanvas.AgInit(canvas);
  },

  // uuCanvas.ready
  ready: function(fn) { // @param Function: callback function
    var lp = function() {
      uuCanvas.already() ? fn() : setTimeout(lp, 16);
    };
    setTimeout(lp, 16);
  }
};

// === 2D Matrix ===========================================
// m11,     m12,     m13
// m21,     m22,     m23
// m31(dx), m32(dy), m33
uuCanvas.Matrix = {
  multiply: function(a, b) {
    return [a[0] * b[0] + a[1] * b[3] + a[2] * b[6],
            a[0] * b[1] + a[1] * b[4] + a[2] * b[7], 0,
            a[3] * b[0] + a[4] * b[3] + a[5] * b[6],
            a[3] * b[1] + a[4] * b[4] + a[5] * b[7], 0,
            a[6] * b[0] + a[7] * b[3] + a[8] * b[6],
            a[6] * b[1] + a[7] * b[4] + a[8] * b[7],
            a[6] * b[2] + a[7] * b[5] + a[8] * b[8]];
  },

  translate: function(x, y) {
    return [1, 0, 0,  0, 1, 0,  x, y, 1];
  },

  rotate: function(angle) {
    var c = _cos(angle), s = _sin(angle);
    return [c, s, 0,  -s, c, 0,  0, 0, 1];
  },

  scale: function(x, y) {
    return [x, 0, 0,  0, y, 0,  0, 0, 1];
  },

  transform: function(m11, m12, m21, m22, dx, dy) {
    return [m11, m12, 0,  m21, m22, 0,  dx,  dy,  1];
  }
};

// === Color ===============================================
uuCanvas.Color = {
  // uuCanvas.Color.hash - color hash
  hash: (function() { // Hash( { black: "#000000" } )
    var rv = [], v, i = 0, iz, item = (
"7b7b7bfc00,0000fffc01,0000bdfc02,4229bdfc03,940084fc04,ad0021fc05,8c1000fc06,"+
"8c1000fc07,522900fc08,007300fc09,006b00fc0a,005a00fc0b,004252fc0c,000000fc0d,"+
"000000fc0e,000000fc0f,bdbdbdfc10,0073f7fc11,0052f7fc12,6b42fffc13,de00cefc14,"+
"e7005afc15,f73100fc16,e75a10fc17,ad7b00fc18,00ad00fc19,00ad00fc1a,00ad42fc1b,"+
"008c8cfc1c,000000fc1d,000000fc1e,000000fc1f,f7f7f7fc20,39bdfffc20,6b84fffc22,"+
"9473f7fc23,f773f7fc24,f75294fc25,f77352fc26,ffa542fc27,f7b500fc28,b5f710fc29,"+
"5ade52fc2a,52f794fc2b,00efdefc2c,737373fc2d,000000fc2e,000000fc2f,fffffffc30,"+
"a5e7fffc31,b5b5f7fc32,d6b5f7fc33,f7b5f7fc34,ffa5c6fc35,efceadfc36,ffe7adfc37,"+
"ffde7bfc38,d6f773fc39,b5f7b5fc3a,b5f7d6fc3b,00fffffc3c,f7d6f7fc3d,000000fc3e,"+
"000000fc3f,000000black,888888gray,ccccccsilver,ffffffwhite,ff0000red,"+
"ffff00yellow,00ff00lime,00ffffaqua,00ffffcyan,0000ffblue,ff00fffuchsia,"+
"ff00ffmagenta,880000maroon,888800olive,008800green,008888teal,000088navy,"+
"880088purple,696969dimgray,808080gray,a9a9a9darkgray,c0c0c0silver,"+
"d3d3d3lightgrey,dcdcdcgainsboro,f5f5f5whitesmoke,fffafasnow,708090slategray,"+
"778899lightslategray,b0c4delightsteelblue,4682b4steelblue,5f9ea0cadetblue,"+
"4b0082indigo,483d8bdarkslateblue,6a5acdslateblue,7b68eemediumslateblue,"+
"9370dbmediumpurple,f8f8ffghostwhite,00008bdarkblue,0000cdmediumblue,"+
"4169e1royalblue,1e90ffdodgerblue,6495edcornflowerblue,87cefalightskyblue,"+
"add8e6lightblue,f0f8ffaliceblue,191970midnightblue,00bfffdeepskyblue,"+
"87ceebskyblue,b0e0e6powderblue,2f4f4fdarkslategray,00ced1darkturquoise,"+
"afeeeepaleturquoise,f0ffffazure,008b8bdarkcyan,20b2aalightseagreen,"+
"48d1ccmediumturquoise,40e0d0turquoise,7fffd4aquamarine,e0fffflightcyan,"+
"00fa9amediumspringgreen,7cfc00lawngreen,00ff7fspringgreen,7fff00chartreuse,"+
"adff2fgreenyellow,2e8b57seagreen,3cb371mediumseagreen,66cdaamediumaquamarine,"+
"98fb98palegreen,f5fffamintcream,006400darkgreen,228b22forestgreen,"+
"32cd32limegreen,90ee90lightgreen,f0fff0honeydew,556b2fdarkolivegreen,"+
"6b8e23olivedrab,9acd32yellowgreen,8fbc8fdarkseagreen,9400d3darkviolet,"+
"8a2be2blueviolet,dda0ddplum,d8bfd8thistle,8b008bdarkmagenta,9932ccdarkorchid,"+
"ba55d3mediumorchid,da70d6orchid,ee82eeviolet,e6e6falavender,"+
"c71585mediumvioletred,bc8f8frosybrown,ff69b4hotpink,ffc0cbpink,"+
"ffe4e1mistyrose,ff1493deeppink,db7093palevioletred,e9967adarksalmon,"+
"ffb6c1lightpink,fff0f5lavenderblush,cd5c5cindianred,f08080lightcoral,"+
"f4a460sandybrown,fff5eeseashell,dc143ccrimson,ff6347tomato,ff7f50coral,"+
"fa8072salmon,ffa07alightsalmon,ffdab9peachpuff,ffffe0lightyellow,"+
"b22222firebrick,ff4500orangered,ff8c00darkorange,ffa500orange,"+
"ffd700gold,fafad2lightgoldenrodyellow,8b0000darkred,a52a2abrown,"+
"a0522dsienna,b8860bdarkgoldenrod,daa520goldenrod,deb887burlywood,f0e68ckhaki,"+
"fffacdlemonchiffon,d2691echocolate,cd853fperu,bdb76bdarkkhaki,bdb76btan,"+
"eee8aapalegoldenrod,f5f5dcbeige,ffdeadnavajowhite,ffe4b5moccasin,"+
"ffe4c4bisque,ffebcdblanchedalmond,ffefd5papayawhip,fff8dccornsilk,"+
"f5deb3wheat,faebd7antiquewhite,faf0e6linen,fdf5e6oldlace,fffaf0floralwhite,"+
"fffff0ivory").split(",");

    for (iz = item.length; i < iz; ++i) {
      v = item[i];
      rv[v.slice(6)] = "#" + v.slice(0, 6);
    }
    return rv;
  })(),

  // uuCanvas.Color.hex - return Hex Color String( "#ffffff" )
  hex: function(rgba) { // @param RGBAHash: Hash( { r,g,b,a })
                        // @return HexColorString( "#ffffff" )
    return ["#", uu.hex[rgba.r], uu.hex[rgba.g], uu.hex[rgba.b]].join("");
  },

  // uuCanvas.Color.rgba - return RGBA Color String( "rgba(0,0,0,0)" )
  rgba: function(rgba) { // @param RGBAHash: Hash( { r,g,b,a })
                         // @return RGBAColorString( "rgba(0,0,0,0)" )
    return "rgba(" + [rgba.r, rgba.g, rgba.b, rgba.a].join(",") + ")";
  },

  // uuCanvas.Color.arrange - arrangemented color(Hue, Saturation and Value)
  //    Hue is absolure value,
  //    Saturation and Value is relative value.
  arrange: function(rgba, // @param RGBAHash: Hash( { r,g,b,a })
                    h,    // @param Number(=0): Hue (from -360 to 360)
                    s,    // @param Number(=0): Saturation (from -100 to 100)
                    v) {  // @param Number(=0): Value (from -100 to 100)
    var rv = uuCanvas.Color.rgba2hsva(rgba), r = 360;
    rv.h += h, rv.h = (rv.h > r) ? rv.h - r : (rv.h < 0) ? rv.h + r : rv.h;
    rv.s += s, rv.s = (rv.s > 100) ? 100 : (rv.s < 0) ? 0 : rv.s;
    rv.v += v, rv.v = (rv.v > 100) ? 100 : (rv.v < 0) ? 0 : rv.v;
    return uuCanvas.Color.hsva2rgba(rv);
  },

  // uuCanvas.Color.parse - parse color
  //    RGBAColorString is "rgba(0,0,0,0)" style color string
  //    HexColorString is "#ffffff" style color string
  //    W3CNamedColorString is "pink" style color string
  parse: function(color) { // @parem RGBAColorString/HexColorString
                           //        /W3CNamedColorString
                           // @return Array: [ HexColorString, Number(alpha) ]
    var c = color.toLowerCase(), m, rex = [
      /^#(([\da-f])([\da-f])([\da-f]))(([\da-f])([\da-f]{2}))?$/,
      /[\d\.]+%/g,
      /(rgb[a]?)\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d\.]+))?\s*\)/
    ];

    if (c !== "transparent") {
      if (c in uuCanvas.Color.hash) {
        return [uuCanvas.Color.hash[c], 1];
      }
      if ( (m = c.match(rex[0])) ) {
        return (c.length > 4) ? [c, 1]
                              : [["#", m[2], m[2],
                                       m[3], m[3],
                                       m[4], m[4]].join(""), 1];
      }
      c = c.replace(rex[1], function(n) {
        return _min((_float(n) || 0) * 2.55, 255) | 0
      });
      if ( (m = c.match(rex[2])) ) {
        return [["#", uu.hex[m[2]], uu.hex[m[3]], uu.hex[m[4]]].join(""),
                m[1] === "rgb" ? 1 : _float(m[5])]; // alpha
      }
    }
    return ["#000000", 0];
  },

  // uuCanvas.Color.hex2rgba - convert Hex Color String( "#ffffff" ) to RGBAHash
  hex2rgba: function(hex) { // @param HexColorString: String( "#ffffff" )
                            // @return RGBAHash: Hash( { r,g,b,a } )
    var n = _int(hex.slice(1), 16);
    return { r: (n >> 16) & 0xff, g: (n >> 8) & 0xff, b: n & 0xff, a: 1 };
  },

  // uuCanvas.Color.rgba2hsva
  rgba2hsva: function(rgba) {
    var r = rgba.r / 255, g = rgba.g / 255, b = rgba.b / 255,
        max = _max(r, g, b), diff = max - _min(r, g, b),
        h = 0, s = max ? _round(diff / max * 100) : 0, v = _round(max * 100);
    if (!s) {
      return { h: 0, s: 0, v: v, a: rgba.a };
    }
    h = (r === max) ? ((g - b) * 60 / diff) :
        (g === max) ? ((b - r) * 60 / diff + 120)
                    : ((r - g) * 60 / diff + 240);
    // HSVAHash( { h:360, s:100, v:100, a:1.0 } )
    return { h: (h < 0) ? h + 360 : h, s: s, v: v, a: rgba.a };
  },

  // uuCanvas.Color.hsva2rgba
  hsva2rgba: function(hsva) {
    var h = (hsva.h >= 360) ? 0 : hsva.h,
        s = hsva.s / 100,
        v = hsva.v / 100,
        a = hsva.a,
        h60 = h / 60, matrix = h60 | 0, f = h60 - matrix,
        v255, p, q, t, w;
    if (!s) {
      h = _round(v * 255);
      return { r: h, g: h, b: h, a: a };
    }
    v255 = v * 255,
    p = _round((1 - s) * v255),
    q = _round((1 - (s * f)) * v255),
    t = _round((1 - (s * (1 - f))) * v255),
    w = _round(v255);
    switch (matrix) {
      case 0: return { r: w, g: t, b: p, a: a };
      case 1: return { r: q, g: w, b: p, a: a };
      case 2: return { r: p, g: w, b: t, a: a };
      case 3: return { r: p, g: q, b: w, a: a };
      case 4: return { r: t, g: p, b: w, a: a };
      case 5: return { r: w, g: p, b: q, a: a };
    }
    return { r: 0, g: 0, b: 0, a: a };
  }
};

// === uuCanvas scope ======================================
(function() {
var _canvasReady = 0,
    _canvasProp = _ie ? 0 : CanvasRenderingContext2D.prototype,
    _metric, // Text Metric Element
    _matrix = uuCanvas.Matrix, _zoom = 10, _halfZoom = _zoom / 2,
    _AgHostCount = 0,
    _prototypes = {},
    _shadowWidth = 4,
    _pixel = { em: 0, pt: 0 },
    _emCache = 0,
    _fontCache = {},
    _colorCache = {}, // { name: ["#ffffff", alpha] }
    _addColorCache = function(c) {
      return _colorCache[c] = uuCanvas.Color.parse(c);
    },
    // property alias
    GLOBAL_ALPHA    = "globalAlpha",
    GLOBAL_COMPO    = "globalCompositeOperation",
    STROKE_STYLE    = "strokeStyle",
    FILL_STYLE      = "fillStyle",
    LINE_WIDTH      = "lineWidth",
    LINE_CAP        = "lineCap",
    LINE_JOIN       = "lineJoin",
    MITER_LIMIT     = "miterLimit",
    SHADOW_OFFSET_X = "shadowOffsetX",
    SHADOW_OFFSET_Y = "shadowOffsetY",
    SHADOW_BLUR     = "shadowBlur",
    SHADOW_COLOR    = "shadowColor",
    FONT            = "font",
    TEXT_ALIGN      = "textAlign",
    TEXT_BASELINE   = "textBaseline",
    MEASURE_STYLE   = "position:absolute;border:0 none;margin:0;padding:0;",
    TRANSPARENT     = "transparent",
    // property sets
    HIT_PROPS       = { width: 1, height: 1 },
    HIT_PROPS2      = { width: 1, height: 1,
                        display: 2, visibility: 2, opacity: 2 },
    COMPOSITES      = { "source-over": 0, "destination-over": 4, copy: 10 },
    SAVE_PROPS      = { strokeStyle: 1, fillStyle: 1, globalAlpha: 1,
                        lineWidth: 1, lineCap: 1, lineJoin: 1, miterLimit: 1,
                        shadowOffsetX: 1, shadowOffsetY: 1, shadowBlur: 1,
                        shadowColor: 1, globalCompositeOperation: 1, font: 1,
                        textAlign: 1, textBaseline: 1, _lineScale: 1,
                        _scaleX: 1, _scaleY: 1, _efx: 1, _clipPath: 1 },
    CAPS            = { square: "square", butt: "flat", round: "round" },
    FONT_SIZES      = { "xx-small": 0.512, "x-small": 0.64, smaller: 0.8,
                        small: 0.8, medium: 1, large: 1.2, larger: 1.2,
                        "x-large": 1.44, "xx-large": 1.728 },
    FONT_STYLES     = { normal: "Normal", italic: "Italic", oblique: "Italic" },
    FONT_WEIGHTS    = { normal: "Normal", bold: "Bold", bolder: "ExtraBold",
                        lighter: "Thin", "100": "Thin", "200": "ExtraLight",
                        "300": "Light", "400": "Normal", "500": "Medium",
                        "600": "SemiBold", "700": "Bold", "800": "ExtraBold",
                        "900": "Black" },
    FONT_SCALES     = { ARIAL: 1.55, "ARIAL BLACK": 1.07,
                        "COMIC SANS MS": 1.15, "COURIER NEW": 1.6,
                        GEORGIA: 1.6, "LUCIDA GRANDE": 1,
                        "LUCIDA SANS UNICODE": 1, "TIMES NEW ROMAN": 1.65,
                        "TREBUCHET MS": 1.55, VERDANA: 1.4, "MS UI GOTHIC": 2,
                        "MS PGOTHIC": 2, MEIRYO: 1,
                        "SANS-SERIF": 1, SERIF: 1, MONOSPACE: 1,
                        FANTASY: 1, CURSIVE: 1 },
    FUNCS           = { 1: "_lfill", 2: "_rfill", 3: "_pfill" },
    // fragments
    AG_FILL         = '" Fill="',
    AG_STROKE       = '" Stroke="',
    AG_DATA         = '" Data="',
    AG_PATH_OPACITY = '<Path Opacity="',
    AG_CANVAS_ZINDEX= '<Canvas Canvas.ZIndex="',
    AG_CANVAS_LEFT  = '" Canvas.Left="',
    AG_CANVAS_TOP   = '" Canvas.Top="',
    VML_COORD       = '" coordsize="100,100',
    VML_FILL        = '" filled="t" stroked="f',
    VML_STROKE      = '" filled="f" stroked="t',
    VML_PATH        = '" path="',
    VML_COLOR       = '" color="',
    VML_COLORS      = '" colors="',
    VML_OPACITY     = '" opacity="',
    VML_ANGLE       = '" angle="',
    VML_FILLTYPE_HEAD = ' filltype="',
    VML_TYPE_HEAD   = ' type="',
    VML_COLOR_HEAD  = ' color="',
    VML_SHAPE_AND_STYLE =
          '<v:shape style="position:absolute;width:10px;height:10px;z-index:',
    VML_END_SHAPE   = '" /></v:shape>',
    VML_VSTROKE     = '"><v:stroke',
    VML_VFILL       = '"><v:fill',
    VML_NS          = 'urn:schemas-microsoft-com:',
    VML_NSV         = '#default#VML',
    DX_PFX          = 'progid:DXImageTransform.Microsoft';

function findCachedImage(src) {
  var ary = _doc.images, i = 0, iz = ary.length;
  for (; i < iz; ++i) {
    if (ary[i].src === src) {
      return ary[i]; // hit
    }
  }
  return void 0; // miss hit
}

function toHTMLEntity(str) {
  return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

// measure unit(pt, em)
function getUnit(really) { // @param Boolean(= false): force re-validate
                           // @return Hash: { pt, em }
  if (really || !_pixel.em) {

    var node = _doc.body.appendChild(_doc.createElement("div"));
    node.style.cssText = MEASURE_STYLE + "width:12pt;height:12em";
    _pixel.pt = node.clientWidth  / 12;
    _pixel.em = node.clientHeight / 12;
    _doc.body.removeChild(node);
  }
  return _pixel;
}

// measure text rect(width, height)
function getTextMetric(text, font) {
  if (!_metric) {
    _metric = _doc.createElement("div");
    // "left:-10000px" is fixed word wrap
    _metric.style.cssText =
        MEASURE_STYLE +
        "top:-10000px;left:-10000px;text-align:left;visibility:hidden";
    _doc.body.appendChild(_metric);
  }
  _metric.style.font = font;
  _metric[uu.innerText] = text;

  var w = 0, h = 0, rect;
  if (_metric.getBoundingClientRect) {
    rect = _metric.getBoundingClientRect();
    w = rect.right - rect.left, h = rect.bottom - rect.top;
  }
  return { w: _metric.clientWidth || w, h: _metric.clientHeight || h };
}

// parse CSS::font style
function parseFont(font) {
  var rv = {}, em, w, sz, fm, elm, style;

  if (font in _fontCache) {
    getUnit(1);
    if (_emCache === _pixel.em) {
      return _fontCache[font];
    }
  }
  getUnit();
  em = _emCache = _pixel.em;

  // computed font style by CSS parser
  elm = _doc.createElement("div"), style = elm.style;
  try {
    style.font = font;
  } catch (err) {}

  rv.style = style.fontStyle;
  rv.variant = style.fontVariant;
  rv.weight = style.fontWeight;
  sz = style.fontSize;
  fm = style.fontFamily.replace(/[\"\']/g, "");

  if ( (w = FONT_SIZES[sz]) ) {
    w *= em;
  } else {
    w = _float(sz);
    if (/em$/.test(sz)) { // "10.5em"
      w *= em;
    } else if (/pt$/.test(sz)) { // "12.3pt"
      w *= _pixel.pt;
    }
  }
  rv.size = _float(w);
  rv.family = "'" + fm.replace(/\s*,\s*/g, "','") + "'";
  rv.rawfamily = fm;
  rv.formal = [rv.style, rv.variant, rv.weight, rv.size + "px",
               rv.family].join(" ");
  return _fontCache[font] = rv;
}

// detect clip and clear color
function detectBackgroundColor(node) {
  var bg = "white", c, n = node, cs;
  while (n) {
    if ( (cs = n.currentStyle) ) {
      bg = cs.backgroundColor;
      if (bg !== TRANSPARENT) {
        break;
      }
    }
    n = n.parentNode;
  }
  c = _addColorCache(bg === TRANSPARENT ? "#fff" : bg);
  return c;
}

function applyCanvasSize(elm) {
  var e = elm, attr = e.attributes;
  if (attr.width && attr.width.specified) {
    e.style.pixelWidth = _int(attr.width.nodeValue);
  } else {
    e.width = e.clientWidth;
  }
  if (attr.height && attr.height.specified) {
    e.style.pixelHeight = _int(attr.height.nodeValue);
  } else {
    e.height = e.clientHeight;
  }
}

function strokeProps(obj, vml) {
  var cap = CAPS[obj[LINE_CAP]],
      join = obj[LINE_JOIN],
      width = (obj[LINE_WIDTH] * obj._lineScale).toFixed(2);
      miter = obj[MITER_LIMIT];
  if (!vml) {
    return ['" StrokeLineJoin="', join,
            '" StrokeMiterLimit="', miter,
            '" StrokeThickness="', width,
            '" StrokeStartLineCap="', cap,
            '" StrokeEndLineCap="', cap].join("");
  }
  return ['" weight="', width, 'px" endcap="', cap,
          '" joinstyle="', join,
          '" miterlimit="', miter].join("");
}

uu.mix(_prototypes, {
  save: function() {
    var prop = {}, i;
    for (i in SAVE_PROPS) { prop[i] = this[i]; }
    this._stack.push([prop, uu.mix([], this._mtx),
                      this._clipPath ? String(this._clipPath) : null]);
  },

  restore: function() {
    if (!this._stack.length) { return; }

    var last = this._stack.pop(), i;
    for (i in SAVE_PROPS) { this[i] = last[0][i]; }
    this._mtx = last[1];
    this._clipPath = last[2];
  },

  scale: function(x, y) {
    this._efx = 1;
    // inlining
    this._mtx = _matrix.multiply([x, 0, 0,  0, y, 0,  0, 0, 1], this._mtx);
    this._scaleX *= x;
    this._scaleY *= y;
    this._lineScale = (this._mtx[0] + this._mtx[4]) / 2;
  },

  rotate: function(angle) {
    this._efx = 1;
    var c = _cos(angle), s = _sin(angle);
    // inlining
    this._mtx = _matrix.multiply([c, s, 0,  -s, c, 0,  0, 0, 1], this._mtx);
  },

  translate: function(x, y) {
    this._efx = 1;
    // inlining
    this._mtx = _matrix.multiply([1, 0, 0,  0, 1, 0,  x, y, 1], this._mtx);
  },

  transform: function(m11, m12, m21, m22, dx, dy) {
    this._efx = 1;
    // inlining
    this._mtx = _matrix.multiply([m11, m12, 0,  m21, m22, 0,  dx, dy, 1],
                                 this._mtx);
  },

  setTransform: function(m11, m12, m21, m22, dx, dy) {
    this._efx = (m11 === 1 && !m12 &&
                 !m21 && m22 === 1 && !dx && !dy) ? 0 : 1;
    this._mtx = _matrix.transform(m11, m12, m21, m22, dx, dy);
  },

  strokeRect: function(x, y, w, h) {
    this.fill(1, this._rect(x, y, w, h));
  },

  beginPath: function() {
    this._path = [];
  },

  arcTo: function(x1, y1, x2, y2, radius) {
    // not impl
  },

  stroke: function() {
    this.fill(1);
  },

  isPointInPath: function(x, y) {
    // not impl
  },

  strokeText: function(text, x, y, maxWidth) {
    this.fillText(text, x, y, maxWidth, 1);
  },

  measureText: function(text) {
    var metric = getTextMetric(text, this[FONT]);
    return new TextMetrics(metric.w, metric.h);
  },

  createImageData: function(sw, sh) {
    // not impl
  },

  getImageData: function(sx, sy, sw, sh) {
    // not impl
  },

  putImageData: function(imagedata, dx, dy, dirtyX, dirtyY,
                         dirtyWidth, dirtyHeight) {
    // not impl
  },

  _initSurface: function(resize) {
    uu.mix(this, {
      // --- compositing ---
      globalAlpha:    1.0,
      globalCompositeOperation: "source-over",
      // --- colors and styles ---
      strokeStyle:    "#000000", // black
      fillStyle:      "#000000", // black
      // --- line caps/joins ---
      lineWidth:      1,
      lineCap:        "butt",
      lineJoin:       "miter",
      miterLimit:     10,
      // --- shadows ---
      shadowOffsetX:  0,
      shadowOffsetY:  0,
      shadowBlur:     0,
      shadowColor:    TRANSPARENT, // transparent black
      // --- text ---
      font:           "10px sans-serif",
      textAlign:      "start",
      textBaseline:   "alphabetic",
      // --- extend properties ---
      xMissColor:     "#000000", // black
      xTextMarginTop: 1.3, // for VML
      xFlyweight:     0, // for Silverlight, VML
      // --- hidden properties ---
      _lineScale:     1,
      _scaleX:        1,
      _scaleY:        1,
      _zindex:        -1,
      _efx:           0 // 1: matrix effected
    });

    this._mtx = [1, 0, 0,  0, 1, 0,  0, 0, 1]; // Matrix.identity
    this._history = []; // canvas rendering history
    this._stack = []; // matrix and prop stack.
    this._path = []; // current path
    this._clipPath = null; // clipping path

    if (this.xType === "VML2D") {
      this._px = 0; // current position x
      this._py = 0; // current position y
      if (resize) {
        this._elm.style.pixelWidth = this.canvas.width;
        this._elm.style.pixelHeight = this.canvas.height;
      }
    } else {
      this.xShadowBlur = uu.ua.ag >= 3 ? 1 : 0;
      this.xTiling = 1; // 1 = TileBrush simulate(slow)
      this._clipRect = null; // clipping rect
    }
    return this;
  }
});

function onPropertyChange(evt) {
  var tgt, name = evt.propertyName;
  if (HIT_PROPS[name]) {
    tgt = evt.srcElement;
    tgt.style[name] = _max(_int(tgt.attributes[name].nodeValue), 0) + "px";
    _canvasReady && tgt.getContext()._initSurface(1)._clear();
  }
}

// from measureText
function TextMetrics(w, h) {
  this.width = w;
  this.height = h;
}

// from createPattern
function Patt(image,        // @param HTMLImageElement:
              repetition) { // @param String/undefined(= undefined):
  repetition = repetition || "repeat";
  switch (repetition) {
  case "repeat": break;
  default: throw "";
  }

  this._type = 3; // 3:tile

  if ("src" in image) { // HTMLImageElement
    this._src = image.src;
    this._repeat = repetition;

    // get actual dimension
    var me = this, cachedImage,
        delayLoader = function() {
      // get actual dimension
      me._w = cachedImage.width;  // image.naturalWidth
      me._h = cachedImage.height; // image.naturalHeight
      cachedImage.onload &&
          (cachedImage.onload = "", cachedImage = void 0); // free
    };
    cachedImage = findCachedImage(image.src);
    if (cachedImage) {
      delayLoader();
    } else {
      cachedImage = new Image();
      cachedImage.onload = delayLoader;
      cachedImage.src = image.src;
    }
  } else if ("getContext" in image) { // HTMLCanvasElement unsupported
    throw "";
  }
}

// from createLinearGradient, createRadialGradient
function Grad(type, param, vml) {
  this._vml = vml;
  this._type = type;
  this._param = param;
  this._colorStop = [];
}

Grad.prototype.addColorStop = function(offset, color) {
  function fn(a, b) { return a.offset - b.offset; }

  var c = _colorCache[color] || _addColorCache(color),
      v, i = 0, iz;

  if (!this._vml) { // Ag
    this._colorStop.push({ offset: offset, color: c });
  } else { // VML
    // collision of the offset is evaded
    for (iz = this._colorStop.length; i < iz; ++i) {
      v = this._colorStop[i];
      if (v.offset === offset) {
        if (offset < 1 && offset > 0) {
          offset += iz / 1000;
        }
      }
    }
    this._colorStop.push({ offset: 1 - offset, color: c });
  }
  this._colorStop.sort(fn); // sort offset
};

// --- Silverlight ---
uuCanvas.AgInit = function(elm) {
  var e = _doc.createElement(elm.outerHTML),
      onload = "uuCanvasAg" + (++_AgHostCount) + "_onload";

  if (elm.parentNode) {
    elm.parentNode.replaceChild(e, elm);
  } else {
    e = elm;
  }
  applyCanvasSize(e);
  e.getContext = function() { return e._ctx2d; };
  e._ctx2d = new Ag2D(e);
  _win[onload] = function(sender) {
    // sender           = <Canvas></Canvas>
    // sender.getHost() = <object></object>
    e._ctx2d._view = sender.children;
    e._ctx2d._content = sender.getHost().content;
    _win[onload] = void 0; // delete hander
  };
  e.innerHTML = [
    '<object type="application/x-silverlight" width="100%" height="100%">',
      '<param name="background" value="#00000000" />',
      '<param name="windowless" value="true" />',
      '<param name="source" value="#xaml" />', // XAML ID
      '<param name="onLoad" value="', onload, '" />',
    '</object>'].join("");
  e.attachEvent("onpropertychange", onPropertyChange);
  return e;
}

// Silverlight(Ag)
function Ag2D(elm) {
  this.canvas = elm;
  this.xType = "Ag2D";
  this._initSurface();
  this._view = null;
  this._content = null;
  this._elm = elm;
};

Ag2D.prototype = {
  _rect: function(x, y, w, h) {
    if (this._efx) {
      var c0 = this._map(x, y),
          c1 = this._map(x + w, y),
          c2 = this._map(x + w, y + h),
          c3 = this._map(x, y + h);
      return [" M", c0.x, " ", c0.y,
              " L", c1.x, " ", c1.y,
              " L", c2.x, " ", c2.y,
              " L", c3.x, " ", c3.y,
              " Z"].join("");
    }
    return [" M", x,     " ", y,
            " L", x + w, " ", y,
            " L", x + w, " ", y + h,
            " L", x,     " ", y + h,
            " Z"].join("");
  },

  _map: function(x, y) {
    var m = this._mtx;
    return {
      x: x * m[0] + y * m[3] + m[6], // x * m11 + y * m21 + dx
      y: x * m[1] + y * m[4] + m[7]  // x * m12 + y * m22 + dy
    }
  },

  // === State =============================================
//save:
//restore:
  // === Transformations ==================================
//scale:
//rotate:
//translate:
//transform:
//setTransform:
  // === Rects ============================================
  clearRect: function(x, y, w, h) {
    w = _int(w), h = _int(h);
    if ((!x && !y &&
         w == this.canvas.width &&
         h == this.canvas.height)) {
      this._clear(); // clear all
    } else {
      var zindex = 0, c = detectBackgroundColor(this._elm), xaml;

      switch (COMPOSITES[this[GLOBAL_COMPO]]) {
      case  4: zindex = --this._zindex; break;
      case 10: this._clear();
      }

      xaml = [AG_PATH_OPACITY, c[1] * this[GLOBAL_ALPHA],
              '" Canvas.ZIndex="', zindex,
              AG_FILL, c[0],
              AG_DATA, this._rect(x, y, w, h), '" />'].join("");
      !this.xFlyweight &&
        this._history.push(this._clipPath ? (xaml = this._clippy(xaml)) : xaml);
      this._view.add(this._content.createFromXaml(xaml, false));
    }
  },

  _clear: function(x, y, w, h) {
    this._history = [];
    this._zindex = 0;
    this._view && this._view.clear(); // fix for IE8
  },

  fillRect: function(x, y, w, h) {
    this.fill(0, this._rect(x, y, w, h));
  },
//strokeRect:

  // === Path API ==========================================
//beginPath:
  closePath: function() {
    this._path.push(" Z");
  },

  moveTo: function(x, y) {
    if (this._efx) {
      var m = this._mtx; // inlining: this._map(x, y)
      this._path.push(" M", x * m[0] + y * m[3] + m[6], " ",
                            x * m[1] + y * m[4] + m[7]);
    } else {
      this._path.push(" M", x, " ", y);
    }
  },

  lineTo: function(x, y) {
    if (this._efx) {
      var m = this._mtx; // inlining: this._map(x, y)
      this._path.push(" L", x * m[0] + y * m[3] + m[6], " ",
                            x * m[1] + y * m[4] + m[7]);
    } else {
      this._path.push(" L", x, " ", y);
    }
  },

  quadraticCurveTo: function(cpx, cpy, x, y) {
    if (this._efx) {
      var c0 = this._map(cpx, cpy), c1 = this._map(x, y);
      cpx = c0.x, cpy = c0.y, x = c1.x, y = c1.y;
    }
    this._path.push(" Q", cpx, " ", cpy, " ", x, " ", y);
  },

  bezierCurveTo: function(cp1x, cp1y, cp2x, cp2y, x, y) {
    if (this._efx) {
      var c0 = this._map(cp1x, cp1y), c1 = this._map(cp2x, cp2y),
          c2 = this._map(x, y);
      cp1x = c0.x, cp1y = c0.y, cp2x = c1.x, cp2y = c1.y, x = c2.x, y = c2.y;
    }
    this._path.push(" C", cp1x, " ", cp1y, " ", cp2x, " ", cp2y, " ",
                          x, " ", y);
  },
//arcTo:
  rect: function(x, y, w, h) {
    this._path.push(this._rect(x, y, w, h));
  },

  arc: function(x, y, radius, startAngle, endAngle, anticlockwise) {
    var deg1 = startAngle * _toDegrees,
        deg2 = endAngle * _toDegrees,
        isLargeArc = 0, magic = 0.0001570796326795,
        sweepDirection = anticlockwise ? 0 : 1,
        sx, sy, ex, ey, rx, ry, c0;

    // angle normalize
    if (deg1 < 0)   { deg1 += 360; }
    if (deg1 > 360) { deg1 -= 360; }
    if (deg2 < 0)   { deg2 += 360; }
    if (deg2 > 360) { deg2 -= 360; }

    // circle
    if (deg1 + 360 == deg2 || deg1 == deg2 + 360) {
      if (sweepDirection) {
        endAngle -= magic;
      } else {
        endAngle += magic;
      }
      isLargeArc = 1;
    } else if (sweepDirection) {
      if (deg2 - deg1 > 180) {
        isLargeArc = 1;
      }
    } else {
      if (deg1 - deg2 > 180) {
        isLargeArc = 1;
      }
    }

    rx = this._scaleX * radius;
    ry = this._scaleY * radius;

    sx = x + (_cos(startAngle) * radius);
    sy = y + (_sin(startAngle) * radius);
    ex = x + (_cos(endAngle) * radius);
    ey = y + (_sin(endAngle) * radius);

    // add <PathFigure StartPoint="..">
    this._path.length ? this.lineTo(sx, sy)
                      : this.moveTo(sx, sy);
    if (this._efx) {
      c0 = this._map(ex, ey);
      ex = c0.x;
      ey = c0.y;
    }
    this._path.push(" A", rx, " ", ry, " 0 ", isLargeArc, " ",
                    sweepDirection, " ", ex, " ", ey);
  },

  fill: function(wire, path) {
    path = path || this._path.join("");

    var rv = [], xaml, zindex = 0, mix, c,
        style = wire ? this[STROKE_STYLE] : this[FILL_STYLE],
        // for shadow
        si = 0, so = 0, sd = 0, sx = 0, sy = 0,
        sc = _colorCache[this[SHADOW_COLOR]] ||
             _addColorCache(this[SHADOW_COLOR]);

    if ( (mix = COMPOSITES[this[GLOBAL_COMPO]]) ) {
      (mix === 4) ? (zindex = --this._zindex) : this._clear();
    }

    if (typeof style === "string") {
      c = _colorCache[style] || _addColorCache(style);

      rv.push(AG_CANVAS_ZINDEX, zindex, '">');

      if (sc[1] && !this.xShadowBlur) {
        sx = _shadowWidth / 2 + this[SHADOW_OFFSET_X];
        sy = _shadowWidth / 2 + this[SHADOW_OFFSET_Y];
        so = 0.01; // shadow opacity from
        sd = 0.05; // shadow opacity delta

        for (; si < _shadowWidth; so += sd, --sx, --sy, ++si) {
          rv.push(AG_PATH_OPACITY, so.toFixed(2),
                  AG_CANVAS_LEFT, sx, AG_CANVAS_TOP, sy,
                  AG_DATA, path,
                  wire ? strokeProps(this) : "",
                  wire ? AG_STROKE : AG_FILL, sc[0], '" />');
        }
      }
      rv.push(AG_PATH_OPACITY, c[1] * this[GLOBAL_ALPHA],
              AG_DATA, path,
              wire ? strokeProps(this) : "",
              wire ? AG_STROKE : AG_FILL, c[0], '">',
              (sc[1] && this.xShadowBlur) ? this._blur("Path", sc) : "",
              '</Path></Canvas>');
      xaml = rv.join("");
    } else {
      xaml = this[FUNCS[style._type]](style, path, wire, mix, zindex, sc);
    }
    !this.xFlyweight &&
      this._history.push(this._clipPath ? (xaml = this._clippy(xaml)) : xaml);
    this._view.add(this._content.createFromXaml(xaml, false));
  },

  // LinearGradient fill
  _lfill: function(style, path, wire, mix, zindex, shadowColor) {
    var rv = [],
        fp = style._param,
        color = this._lcolor(style._colorStop),
        prop = wire ? "Stroke" : "Fill",
        c0 = this._map(fp.x0, fp.y0), c1 = this._map(fp.x1, fp.y1),
        // for shadow
        si = 0, siz = _shadowWidth, sc, so = 0, sd = 0, shx = 0, shy = 0;

    rv.push(AG_CANVAS_ZINDEX, zindex, '">');

    if (shadowColor[1] && !this.xShadowBlur) {
      sc = this._lcolor([
        { offset: 0.0, color: shadowColor },
        { offset: 1.0, color: shadowColor }
      ]);
      shx = _shadowWidth / 2 + this[SHADOW_OFFSET_X];
      shy = _shadowWidth / 2 + this[SHADOW_OFFSET_Y];
      so = 0.01; // shadow opacity from
      sd = 0.05; // shadow opacity delta

      if (wire) {
        siz = this[LINE_WIDTH];
        sd = 0.2 / siz; // opacity from 0.05 to 0.25
      }
      for (; si < siz; so += sd, --shx, --shy, ++si) {
        rv.push(AG_PATH_OPACITY, so.toFixed(2),
                AG_CANVAS_LEFT, shx, AG_CANVAS_TOP, shy,
                AG_DATA, path,
                wire ? strokeProps(this) : "", '"><Path.', prop,
                '><LinearGradientBrush MappingMode="Absolute" StartPoint="',
                c0.x, ",", c0.y,
                '" EndPoint="', c1.x, ",", c1.y, '">', sc,
                '</LinearGradientBrush></Path.', prop, '></Path>');
      }
    }

    rv.push(AG_PATH_OPACITY, this[GLOBAL_ALPHA],
            AG_DATA, path,
            wire ? strokeProps(this) : "", '"><Path.', prop,
            '><LinearGradientBrush MappingMode="Absolute" StartPoint="',
            c0.x, ",", c0.y,
              '" EndPoint="', c1.x, ",", c1.y, '">', color,
            '</LinearGradientBrush></Path.', prop, '>',
              (shadowColor[1] &&
               this.xShadowBlur) ? this._blur("Path", shadowColor) : "",
            '</Path></Canvas>');
    return rv.join("");
  },

  // RadialGradient fill
  _rfill: function(style, path, wire, mix, zindex, shadowColor) {
    var rv = [], prop = wire ? "Stroke" : "Fill",
        fp = style._param,
        zindex2 = 0,
        color = this._rcolor(style),
        rr = fp.r1 * 2,
        x = fp.x1 - fp.r1,
        y = fp.y1 - fp.r1,
        gx = (fp.x0 - (fp.x1 - fp.r1)) / rr,
        gy = (fp.y0 - (fp.y1 - fp.r1)) / rr,
        m = _matrix.multiply(_matrix.translate(x, y), this._mtx),
        tmpmtx = this._trns('Ellipse', m),
        v, bari = "",
        // for shadow
        si = 0, siz = _shadowWidth, so = 0, sd = 0, sx = 0, sy = 0;

    rv.push(AG_CANVAS_ZINDEX, zindex, '">');

    if (shadowColor[1] && !this.xShadowBlur) {
      sx = _shadowWidth / 2 + this[SHADOW_OFFSET_X];
      sy = _shadowWidth / 2 + this[SHADOW_OFFSET_Y];
      so = 0.01; // shadow opacity from
      sd = 0.05; // shadow opacity delta

      if (wire) {
        siz = this[LINE_WIDTH];
        sd = 0.2 / siz; // opacity from 0.05 to 0.25
      }

      for (; si < siz; so += sd, --sx, --sy, ++si) {
        rv.push('<Ellipse Opacity="', so.toFixed(2),
                AG_CANVAS_LEFT, sx, AG_CANVAS_TOP, sy,
                '" Width="', rr, '" Height="', rr,
                wire ? strokeProps(this) : "",
                wire ? AG_STROKE : AG_FILL, shadowColor[0],
                '">', tmpmtx, '</Ellipse>');
      }
    }

    if (!wire) {
      // fill outside
      if (style._colorStop.length) {
        v = style._colorStop[style._colorStop.length - 1];
        if (v.color[1] > 0.001) {
          if (mix === 4) { zindex2 = --this._zindex; }
          bari =  [ AG_PATH_OPACITY, this[GLOBAL_ALPHA],
                    '" Canvas.ZIndex="', zindex2,
                    AG_DATA, path, AG_FILL, '#',
                    uu.hex[_float(v.color[1] / (1 / 255))] +
                    v.color[0].substring(1),
                    '" />'].join("");
          !this.xFlyweight &&
            this._history.push(this._clipPath ? (bari = this._clippy(bari))
                                              : bari);
          this._view.add(this._content.createFromXaml(bari, false));
        }
      }
    }

    rv.push('<Ellipse Opacity="', this[GLOBAL_ALPHA],
            '" Width="', rr, '" Height="', rr,
            wire ? strokeProps(this) : "",
            '"><Ellipse.', prop, '><RadialGradientBrush GradientOrigin="',
            gx, ',', gy,
            '" Center="0.5,0.5" RadiusX="0.5" RadiusY="0.5">', color,
            '</RadialGradientBrush></Ellipse.', prop, '>',
              tmpmtx,
              (shadowColor[1] &&
               this.xShadowBlur) ? this._blur("Ellipse", shadowColor) : "",
            '</Ellipse></Canvas>');
    return rv.join("");
  },

  // Pattern fill
  _pfill: function(style, path, wire, mix, zindex, shadowColor) {
    var rv = [], prop = wire ? "Stroke" : "Fill",
        zindex2 = 0,
        sw, sh, xz, yz, x, y, // use tile mode
        // for shadow
        si = 0, so = 0, sd = 0, sx = 0, sy = 0;

    if (!wire && this.xTiling) {
      x  = 0;
      y  = 0;
      sw = style._w;
      sh = style._h;
      xz = _ceil(_int(this.canvas.width)  / sw);
      yz = _ceil(_int(this.canvas.height) / sh);

      if (mix === 4) { zindex2 = --this._zindex; }

      rv.push(AG_CANVAS_ZINDEX, zindex, '">');

      if (shadowColor[1]) {
        sx = _shadowWidth / 2 + this[SHADOW_OFFSET_X];
        sy = _shadowWidth / 2 + this[SHADOW_OFFSET_Y];
        so = 0.01; // shadow opacity from
        sd = 0.05; // shadow opacity delta

        for (; si < _shadowWidth; so += sd, --sx, --sy, ++si) {
          rv.push(AG_PATH_OPACITY, so.toFixed(2),
                  AG_CANVAS_LEFT, sx, AG_CANVAS_TOP, sy,
                  AG_DATA, path, wire ? strokeProps(this) : "",
                  AG_FILL, shadowColor[0],
                  '" />');
        }
      }

      rv.push(AG_CANVAS_ZINDEX, zindex2, '" Clip="', path, '">');
      for (y = 0; y < yz; ++y) {
        for (x = 0; x < xz; ++x) {
          rv.push('<Image Opacity="', this[GLOBAL_ALPHA],
                  AG_CANVAS_LEFT, x * sw, AG_CANVAS_TOP, y * sh,
                  '" Source="', style._src, '">',
//                  (shadowColor[1] &&
//                   this.xShadowBlur) ? this._blur("Image", shadowColor) : "",
                  '</Image>');
        }
      }
      rv.push('</Canvas></Canvas>');

      return rv.join("");
    }

    rv.push(AG_CANVAS_ZINDEX, zindex, '">');

    if (shadowColor[1] && !this.xShadowBlur) {
      sx = _shadowWidth / 2 + this[SHADOW_OFFSET_X];
      sy = _shadowWidth / 2 + this[SHADOW_OFFSET_Y];
      so = 0.01; // shadow opacity from
      sd = 0.05; // shadow opacity delta

      for (; si < _shadowWidth; so += sd, --sx, --sy, ++si) {
        rv.push(AG_PATH_OPACITY, so.toFixed(2),
                AG_CANVAS_LEFT, sx, AG_CANVAS_TOP, sy,
                AG_DATA, path, wire ? strokeProps(this) : "",
                '"><Path.', prop, '><ImageBrush Stretch="None" ImageSource="',
                style._src,
                '" /></Path.', prop, '></Path>');
      }
    }

    rv.push(AG_PATH_OPACITY, this[GLOBAL_ALPHA],
            wire ? strokeProps(this) : "",
            AG_DATA, path,
            '"><Path.', prop, '><ImageBrush Stretch="None" ImageSource="',
            style._src,
            '" /></Path.', prop, '>',
              (shadowColor[1] &&
               this.xShadowBlur) ? this._blur("Path", shadowColor) : "",
            '</Path></Canvas>');
    return rv.join("");
  },
//stroke:
  clip: function() {
    this._clipPath = this._path.join("");
  },

  _clippy: function(xaml) {
    return ['<Canvas Clip="', this._clipPath, '">', xaml,
            '</Canvas>'].join("");
  },
//isPointInPath:
  // === Text ==============================================
  fillText: function(text, x, y, maxWidth, wire) {
    text = text.replace(/(\t|\v|\f|\r\n|\r|\n)/g, " ");
    var style = wire ? this[STROKE_STYLE] : this[FILL_STYLE],
        types = (typeof style === "string") ? 0 : style._type,
        rv = [], xaml, c, fp, c0, c1, zindex = 0, mtx, rgx, rgy,
        font = parseFont(this[FONT]),
        metric = getTextMetric(text, font.formal),
        offX = 0, align = this[TEXT_ALIGN], dir = "ltr",
        // for shadow
        si = 0, so = 0, sd = 0, sx = 0, sy = 0,
        sc = _colorCache[this[SHADOW_COLOR]] ||
             _addColorCache(this[SHADOW_COLOR]);

    switch (align) {
    case "end": dir = "rtl"; // break;
    case "start":
      align = this._elm.currentStyle.direction === dir ? "left" : "right"
    }
    if (align === "center") {
      offX = (metric.w - 4) / 2; // -4: adjust
    } else if (align === "right") {
      offX = metric.w;
    }

    mtx = this._trns('TextBlock',
                     _matrix.multiply(_matrix.translate(x - offX, y),
                                      this._mtx));

    switch (COMPOSITES[this[GLOBAL_COMPO]]) {
    case  4: zindex = --this._zindex; break;
    case 10: this._clear();
    }

    rv.push(AG_CANVAS_ZINDEX, zindex, '">');

    if (sc[1] && !this.xShadowBlur &&
        (this[SHADOW_OFFSET_X] || this[SHADOW_OFFSET_Y])) {
      sx = _shadowWidth / 2 + this[SHADOW_OFFSET_X];
      sy = _shadowWidth / 2 + this[SHADOW_OFFSET_Y];
      so = 0.10; // shadow opacity from
      sd = 0.05; // shadow opacity delta

      for (; si < _shadowWidth; so += sd, --sx, --sy, ++si) {
        rv.push('<TextBlock Opacity="', so.toFixed(2),
                '" Foreground="', sc[0],
                AG_CANVAS_LEFT, sx, AG_CANVAS_TOP, sy,
                '" FontFamily="', font.rawfamily,
                '" FontSize="', font.size.toFixed(2),
                '" FontStyle="', FONT_STYLES[font.style] || "Normal",
                '" FontWeight="', FONT_WEIGHTS[font.weight] || "Normal",
                '">', toHTMLEntity(text), mtx, '</TextBlock>');
      }
    }

    if (!types) {
      c = _colorCache[style] || _addColorCache(style);
      rv.push('<TextBlock Opacity="', c[1] * this[GLOBAL_ALPHA],
              '" Foreground="', c[0]);
    } else {
      rv.push('<TextBlock Opacity="', this[GLOBAL_ALPHA]);
    }
    rv.push('" FontFamily="', font.rawfamily,
            '" FontSize="', font.size.toFixed(2),
            '" FontStyle="', FONT_STYLES[font.style] || "Normal",
            '" FontWeight="', FONT_WEIGHTS[font.weight] || "Normal",
            '">', toHTMLEntity(text), mtx,
              (sc[1] && this.xShadowBlur) ? this._blur("TextBlock", sc) : "");

    switch (types) {
    case 1: c = this._lcolor(style._colorStop);
            fp = style._param;
            c0 = this._map(fp.x0, fp.y0), c1 = this._map(fp.x1, fp.y1),
            rv.push('<TextBlock.Foreground>',
                    '<LinearGradientBrush MappingMode="Absolute" StartPoint="',
                    c0.x, ",", c0.y,
                    '" EndPoint="', c1.x, ",", c1.y, '">', c,
                    '</LinearGradientBrush></TextBlock.Foreground>');
            break;
    case 2: c = this._rcolor(style);
            fp = style._param,
            rgx = (fp.x0 - (fp.x1 - fp.r1)) / (fp.r1 * 2),
            rgy = (fp.y0 - (fp.y1 - fp.r1)) / (fp.r1 * 2),
            rv.push('<TextBlock.Foreground>',
                    '<RadialGradientBrush GradientOrigin="', rgx, ',', rgy,
                    '" Center="0.5,0.5" RadiusX="0.5" RadiusY="0.5">', c,
                    '</RadialGradientBrush></TextBlock.Foreground>');
            break;
    case 3: rv.push('<TextBlock.Foreground>',
                    '<ImageBrush Stretch="None" ImageSource="', style._src,
                    '" /></TextBlock.Foreground>');
    }
    rv.push('</TextBlock></Canvas>');
    xaml = rv.join("");
    !this.xFlyweight &&
      this._history.push(this._clipPath ? (xaml = this._clippy(xaml)) : xaml);
    this._view.add(this._content.createFromXaml(xaml, false));
  },
//strokeText:
//measureText:
  // === Drawing images ====================================
  // drawImage(image, dx, dy)
  // drawImage(image, dx, dy, dw, dh)
  // drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh)
  drawImage: function(image) {
    var rv = [], xaml, a = arguments, az = a.length, me = this,
        dx, dy, dw, dh, sx = 0, sy = 0, sw, sh, iw, ih,
        bw, bh, w, h, x, y, // slice
        m, tmpmtx, size = "", clip = "",
        cachedImage, delayLoader,
        zindex = 0, sclip = "",
        i = 0, iz, // for copy canvas
        // for shadow
        si = 0, so = 0, sd = 0, shx = 0, shy = 0,
        sc = _colorCache[this[SHADOW_COLOR]] ||
             _addColorCache(this[SHADOW_COLOR]);

    switch (COMPOSITES[this[GLOBAL_COMPO]]) {
    case  4: zindex = --this._zindex; break;
    case 10: this._clear();
    }

    if ("src" in image) { // image is HTMLImageElement
      delayLoader = function() {
        // get actual dimension
        iw = cachedImage.width;  // image.naturalWidth
        ih = cachedImage.height; // image.naturalHeight
        cachedImage.onload &&
            (cachedImage.onload = "", cachedImage = void 0); // free

        if (az < 9) {
          dx = a[1], dy = a[2], dw = a[3] || iw, dh = a[4] || ih,
          sw = iw, sh = ih;
          m = _matrix.multiply(_matrix.translate(dx, dy), me._mtx);

          if (az === 5) {
            size = ['" Width="', dw, '" Height="', dh].join("");
          }
        } else {
          dx = a[5], dy = a[6], dw = a[7], dh = a[8],
          sx = a[1], sy = a[2], sw = a[3], sh = a[4];

          bw = dw / sw; // bias width
          bh = dh / sh; // bias height
          w = bw * iw;
          h = bh * ih;
          x = dx - (bw * sx);
          y = dy - (bh * sy);

          m = _matrix.multiply(_matrix.translate(x, y), me._mtx);

          size = ['" Width="', w, '" Height="', h].join("");
          clip = ['<Image.Clip><RectangleGeometry Rect="',
                    [dx - x, dy - y, dw, dh].join(" "),
                  '" /></Image.Clip>'].join("");
          if (sc[1] && !me.xShadowBlur) {
            sclip = ['<Rectangle.Clip><RectangleGeometry Rect="',
                      [dx - x, dy - y, dw, dh].join(" "),
                     '" /></Rectangle.Clip>'].join("");
          }
        }

        rv.push(AG_CANVAS_ZINDEX, zindex, '">');

        if (sc[1] && !me.xShadowBlur) {
          shx = _shadowWidth / 2 + me[SHADOW_OFFSET_X];
          shy = _shadowWidth / 2 + me[SHADOW_OFFSET_Y];
          so = 0.01; // shadow opacity from
          sd = 0.05; // shadow opacity delta
          tmpmtx = me._trns('Rectangle', m);

          for (; si < _shadowWidth; so += sd, --shx, --shy, ++si) {
            rv.push('<Rectangle Opacity="', so.toFixed(2),
                    AG_CANVAS_LEFT, shx, AG_CANVAS_TOP, shy,
                    size, AG_FILL, sc[0], '">', sclip,
                    tmpmtx,
                    '</Rectangle>');
          }
        }

        rv.push('<Image Opacity="', me[GLOBAL_ALPHA],
                '" Source="', image.src, size, '">',
                clip, me._trns('Image', m),
                (sc[1] && me.xShadowBlur) ? me._blur("Image", sc) : "",
                '</Image></Canvas>');
        xaml = rv.join("");
        !me.xFlyweight &&
          me._history.push(me._clipPath ? (xaml = me._clippy(xaml)) : xaml);
        me._view.add(me._content.createFromXaml(xaml, false));
      }

      cachedImage = findCachedImage(image.src);
      if (cachedImage) {
        delayLoader();
      } else {
        cachedImage = new Image();
        cachedImage.onload = delayLoader;
        cachedImage.src = image.src;
      }
    } else { // HTMLCanvasElement
      iw = image.width;
      ih = image.height;

      iz = image._ctx2d._history.length;
      if (az < 9) {
        dx = a[1], dy = a[2], dw = a[3] || iw, dh = a[4] || ih,
        sw = iw, sh = ih;
        m = _matrix.multiply(_matrix.translate(dx, dy), this._mtx);

        if (az === 5) {
          m = _matrix.multiply(_matrix.scale(dw / iw, dh / ih), m);
        }
      } else {
        dx = a[5], dy = a[6], dw = a[7], dh = a[8],
        sx = a[1], sy = a[2], sw = a[3], sh = a[4];

        bw = dw / sw; // bias width
        bh = dh / sh; // bias height
        w = bw * iw;
        h = bh * ih;
        x = dx - (bw * sx);
        y = dy - (bh * sy);

        m = _matrix.multiply(_matrix.translate(x, y), this._mtx);
        m = _matrix.multiply(_matrix.scale(bw, bh), m);

        clip = ['<Canvas.Clip><RectangleGeometry Rect="',
                  [(dx - x) / bw, (dy - y) / bh, dw / bw, dh / bh].join(" "),
                '" /></Canvas.Clip>'].join("");
//        if (sc[1] && !this.xShadowBlur) {
//          sclip = ['<Rectangle.Clip><RectangleGeometry Rect="',
//                   [(dx - x) / bw, (dy - y) / bh, dw / bw, dh / bh].join(" "),
//                   '" /></Rectangle.Clip>'].join("");
//        }
      }

      // shadow not impl

      rv.push(AG_CANVAS_ZINDEX, zindex,
              '" Opacity="', this[GLOBAL_ALPHA], // image._ctx2d[GLOBAL_ALPHA],
              size, '">',
              clip, this._trns('Canvas', m),
//              (sc[1] && this.xShadowBlur) ? this._blur("Canvas", sc) : "",
              '<Canvas>');

      for (; i < iz; ++i) {
        rv.push(image._ctx2d._history[i]);
      }
      rv.push('</Canvas></Canvas>');

      xaml = rv.join("");
      !this.xFlyweight &&
        this._history.push(this._clipPath ? (xaml = this._clippy(xaml)) : xaml);
      this._view.add(this._content.createFromXaml(xaml, false));
    }
  },

  // === Pixel manipulation ================================
//createImageData:
//getImageData:
//putImageData:
  // === Gradient ==========================================
  createLinearGradient: function(x0, y0, x1, y1) {
    return new Grad(1, // 1:LinearGradient
                    { x0: x0, y0: y0, x1: x1, y1: y1 });
  },

  createRadialGradient: function(x0, y0, r0, x1, y1, r1) {
    return new Grad(2, // 2:RadialGradient
                    { x0: x0, y0: y0, r0: r0, x1: x1, y1: y1, r1: r1 });
  },

  createPattern: function(image, repetition) {
    return new Patt(image, repetition);
  },

  // build Linear Color
  _lcolor: function(ary) {
    var rv = [], v, i = 0, iz = ary.length, n = 1 / 255;
    for (; i < iz; ++i) {
      v = ary[i];
      rv.push('<GradientStop Color="#',
                uu.hex[_float(v.color[1] / n)],
                v.color[0].substring(1),
                '" Offset="', v.offset, '" />');
    }
    return rv.join("");
  },

  // build Radial Color
  _rcolor: function(style) {
    var rv = [],
        fp = style._param, n = 1 / 255,
        r0 = fp.r0 / fp.r1,
        remain = 1 - r0,
        v,
        i = 0,
        iz = style._colorStop.length;
    if (!iz) { return ""; }

    rv.push('<GradientStop Color="#',
              uu.hex[_float(style._colorStop[0].color[1] / n)],
              style._colorStop[0].color[0].substring(1),
              '" Offset="', 0, '" />');
    for (i = 0; i < iz; ++i) {
      v = style._colorStop[i];
      rv.push('<GradientStop Color="#',
                uu.hex[_float(v.color[1] / n)],
                v.color[0].substring(1),
                '" Offset="', (v.offset * remain + r0), '" />');
    }
    return rv.join("");
  },

  // build MatrixTransform
  _trns: function(type, m) {
    return [
      '<', type,
      '.RenderTransform><MatrixTransform><MatrixTransform.Matrix><Matrix M11="',
                 m[0], '" M21="', m[3], '" OffsetX="', m[6],
      '" M12="', m[1], '" M22="', m[4], '" OffsetY="', m[7],
      '" /></MatrixTransform.Matrix></MatrixTransform></', type,
      '.RenderTransform>'].join("");
  },

  // build Shadow Blur
  _blur: function(type, shadowColor) {
    var sdir = 0, sdepth = 0,
        sx = this[SHADOW_OFFSET_X],
        sy = this[SHADOW_OFFSET_Y];

    if (sx || sy) {
      sdir = (sx > 0 && sy < 0) ?  45 :
             (!sx    && sy < 0) ?  90 :
             (sx < 0 && sy < 0) ? 135 :
             (sx < 0 && !sy   ) ? 180 :
             (sx < 0 && sy > 0) ? 225 :
             (!sx    && sy > 0) ? 270 :
             (sx > 0 && sy > 0) ? 315 : 0;
      if (sx || sy) {
        sdepth = _max(_math.abs(sx), _math.abs(sy)) * 1.2;
      }
      return ['<', type, '.Effect><DropShadowEffect Opacity="', 1.0,
              '" Color="', shadowColor[0],
              '" BlurRadius="', this[SHADOW_BLUR] * 1.2,
              '" Direction="', sdir,
              '" ShadowDepth="', sdepth,
              '" /></', type, '.Effect>'].join("");
    }
    return "";
  }
};
uu.mix(Ag2D.prototype, _prototypes);

// --- VML ---
uuCanvas.VMLInit = function(elm) {
  var e = _doc.createElement(elm.outerHTML);

  if (elm.parentNode) {
    elm.parentNode.replaceChild(e, elm);
  } else {
    e = elm;
  }
  applyCanvasSize(e);
  e.getContext = function() { return e._ctx2d; }
  e._ctx2d = new VML2D(e);
  e.attachEvent("onpropertychange", onPropertyChange);
  return e;
}

function VML2D(elm) {
  this.canvas = elm;
  this.xType = "VML2D";
  this._initSurface();
  this._elm = elm.appendChild(_doc.createElement("div"));
  this._elm.style.pixelWidth = elm.width;
  this._elm.style.pixelHeight = elm.height;
  this._elm.style.overflow = "hidden";
  this._elm.style.position = "absolute";
  this._elm.uuCSSDirection = this._elm.currentStyle.direction; // keep dir
  this._elm.style.direction = "ltr";
  this._clipRect = this._rect(0, 0, this.canvas.width, this.canvas.height);
  var bg = detectBackgroundColor(this._elm);
  this.xClipStyle = bg[0];
};

VML2D.prototype = {
  _rect: function(x, y, w, h) {
    var c0 = this._map(x, y),
        c1 = this._map(x + w, y),
        c2 = this._map(x + w, y + h),
        c3 = this._map(x, y + h);
    return [" m", c0.x, " ", c0.y,
            " l", c1.x, " ", c1.y,
            " l", c2.x, " ", c2.y,
            " l", c3.x, " ", c3.y,
            " x"].join("");
  },

  _map: function(x, y) {
    var m = this._mtx;
    return { x: _round((x * m[0] + y * m[3] + m[6]) * _zoom - _halfZoom),
             y: _round((x * m[1] + y * m[4] + m[7]) * _zoom - _halfZoom) };
  },

  // === State =============================================
//save:
//restore:
  // === Transformations ===================================
//scale:
//rotate:
//translate:
//transform:
//setTransform:
  // === Rects =============================================
  clearRect: function(x, y, w, h) {
    w = _int(w), h = _int(h);
    if ((!x && !y &&
         w == this.canvas.width &&
         h == this.canvas.height)) {
      this._clear();
    } else {
      var zindex = 0, c = detectBackgroundColor(this._elm), vml;

      switch (COMPOSITES[this[GLOBAL_COMPO]]) {
      case  4: zindex = --this._zindex; break;
      case 10: this._clear();
      }

      vml =  [VML_SHAPE_AND_STYLE, zindex,
              VML_FILL, VML_COORD, VML_PATH, this._rect(x, y, w, h),
              VML_VFILL, VML_TYPE_HEAD, 'solid',
              VML_COLOR, c[0], VML_OPACITY, c[1] * this[GLOBAL_ALPHA],
              VML_END_SHAPE].join("");
      !this.xFlyweight &&
        this._history.push(this._clipPath ? (vml = this._clippy(vml)) : vml);
      this._elm.insertAdjacentHTML("beforeEnd", vml);
    }
  },

  _clear: function() {
    this._history = [];
    this._elm.innerHTML = ""; // clear all
    this._zindex = 0;
  },

  fillRect: function(x, y, w, h) {
    var path = this._rect(x, y, w, h);
    this._px = x;
    this._py = y;

    // When all canvases are painted out,
    // the fillStyle(background-color) is preserved.
    if (path === this._clipRect) {
      if (typeof this[FILL_STYLE] === "string") {
        this.xClipStyle = this[FILL_STYLE];
      }
    }
    this.fill(0, path);
  },
//strokeRect:
  // === Path API ==========================================
//beginPath:
  closePath: function() {
    this._path.push(" x");
  },

  moveTo: function(x, y) {
    var m = this._mtx; // inlining: this._map(x, y)
    this._path.push(
      "m ", _round((x * m[0] + y * m[3] + m[6]) * _zoom - _halfZoom), " ",
            _round((x * m[1] + y * m[4] + m[7]) * _zoom - _halfZoom));
    this._px = x;
    this._py = y;
  },

  lineTo: function(x, y) {
    var m = this._mtx; // inlining: this._map(x, y)
    this._path.push(
      "l ", _round((x * m[0] + y * m[3] + m[6]) * _zoom - _halfZoom), " ",
            _round((x * m[1] + y * m[4] + m[7]) * _zoom - _halfZoom));
    this._px = x;
    this._py = y;
  },

  quadraticCurveTo: function(cpx, cpy, x, y) {
    var cp1x = this._px + 2.0 / 3.0 * (cpx - this._px),
        cp1y = this._py + 2.0 / 3.0 * (cpy - this._py),
        cp2x = cp1x + (x - this._px) / 3.0,
        cp2y = cp1y + (y - this._py) / 3.0,
        c0 = this._map(x, y),
        c1 = this._map(cp1x, cp1y),
        c2 = this._map(cp2x, cp2y);
    this._path.push("c ", c1.x, " ", c1.y, " ",
                          c2.x, " ", c2.y, " ",
                          c0.x, " ", c0.y);
    this._px = x;
    this._py = y;
  },

  bezierCurveTo: function(cp1x, cp1y, cp2x, cp2y, x, y) {
    var c0 = this._map(x, y),
        c1 = this._map(cp1x, cp1y),
        c2 = this._map(cp2x, cp2y);
    this._path.push("c ", c1.x, " ", c1.y, " ",
                          c2.x, " ", c2.y, " ",
                          c0.x, " ", c0.y);
    this._px = x;
    this._py = y;
  },
//arcTo:
  rect: function(x, y, w, h) {
    this._path.push(this._rect(x, y, w, h));
    this._px = x;
    this._py = y;
  },

  arc: function(x, y, radius, startAngle, endAngle, anticlockwise) {
    radius *= _zoom;
    var x1 = x + (_cos(startAngle) * radius) - _halfZoom,
        y1 = y + (_sin(startAngle) * radius) - _halfZoom,
        x2 = x + (_cos(endAngle)   * radius) - _halfZoom,
        y2 = y + (_sin(endAngle)   * radius) - _halfZoom,
        c0, c1, c2, rx, ry;

    if (!anticlockwise) {
      // fix "wa" bug
      (x1.toExponential(5) === x2.toExponential(5)) && (x1 += 0.125);
      (y1.toExponential(5) === y2.toExponential(5)) && (y1 += 0.125);
    }
    c0 = this._map(x, y),
    c1 = this._map(x1, y1),
    c2 = this._map(x2, y2),
    rx = this._scaleX * radius,
    ry = this._scaleY * radius;
    this._path.push(anticlockwise ? "at " : "wa ",
                    c0.x - rx, " ", c0.y - ry, " ",
                    c0.x + rx, " ", c0.y + ry, " ",
                    c1.x, " ", c1.y, " ",
                    c2.x, " ", c2.y);
  },

  fill: function(wire, path) {
    path = path || this._path.join("");

    var rv = [], vml, zindex = 0, mix, c,
        style = wire ? this[STROKE_STYLE] : this[FILL_STYLE],
        // for shadow
        si = 0, so = 0, sd = 0, sx = 0, sy = 0,
        sc = _colorCache[this[SHADOW_COLOR]] ||
             _addColorCache(this[SHADOW_COLOR]);

    if ( (mix = COMPOSITES[this[GLOBAL_COMPO]]) ) {
      (mix === 4) ? (zindex = --this._zindex) : this._clear();
    }

    if (typeof style === "string") {
      c = _colorCache[style] || _addColorCache(style);

      if (sc[1]) {
        sx = _shadowWidth / 2 + this[SHADOW_OFFSET_X];
        sy = _shadowWidth / 2 + this[SHADOW_OFFSET_Y];
        so = 0.01; // shadow opacity from
        sd = 0.05; // shadow opacity delta

        for (; si < _shadowWidth; so += sd, --sx, --sy, ++si) {
          rv.push(VML_SHAPE_AND_STYLE, zindex,
                  ';left:', sx,
                  'px;top:', sy, 'px',
                  wire ? VML_STROKE : VML_FILL,
                  VML_COORD, VML_PATH, path,
                  wire ? VML_VSTROKE : VML_VFILL,
                  VML_COLOR_HEAD, sc[0],
                  VML_OPACITY, so.toFixed(2),
                  wire ? strokeProps(this, 1) : "",
                  VML_END_SHAPE);
        }
      }

      rv.push(VML_SHAPE_AND_STYLE, zindex,
              wire ? VML_STROKE : VML_FILL,
              VML_COORD, VML_PATH, path,
              wire ? VML_VSTROKE : VML_VFILL,
              VML_COLOR_HEAD, c[0],
              VML_OPACITY, c[1] * this[GLOBAL_ALPHA],
              wire ? strokeProps(this, 1) : "",
              VML_END_SHAPE);

      vml = rv.join("");
    } else {
      vml = this[FUNCS[style._type]](style, path, wire, mix, zindex, sc);
    }
    !this.xFlyweight &&
      this._history.push(this._clipPath ? (vml = this._clippy(vml)) : vml);
    this._elm.insertAdjacentHTML("beforeEnd", vml);
  },

  _lfill: function(style, path, wire, mix, zindex, shadowColor) {
    var rv = [],
        fp = style._param,
        c0 = this._map(fp.x0, fp.y0),
        c1 = this._map(fp.x1, fp.y1),
        angle = _math.atan2(c1.x - c0.x, c1.y - c0.y) * _toDegrees,
        color = this._gcolor(style._colorStop),
        // for shadow
        si = 0, siz = _shadowWidth, so = 0, sd = 0, sx = 0, sy = 0;

    (angle < 0) && (angle += 360);

    if (shadowColor[1]) {
      sx = _shadowWidth / 2 + this[SHADOW_OFFSET_X];
      sy = _shadowWidth / 2 + this[SHADOW_OFFSET_Y];
      so = 0.01; // shadow opacity from
      sd = 0.05; // shadow opacity delta

      if (wire) {
        siz = this[LINE_WIDTH];
        sd = 0.2 / siz; // opacity from 0.05 to 0.25
      }
      for (; si < siz; so += sd, --sx, --sy, ++si) {
        rv.push(VML_SHAPE_AND_STYLE, zindex,
                ';left:', sx, 'px;top:', sy, 'px',
                VML_COORD, wire ? VML_STROKE : VML_FILL,
                VML_PATH, path,
                  // brush
                  wire ? VML_VSTROKE : VML_VFILL,
                  wire ? VML_FILLTYPE_HEAD : VML_TYPE_HEAD,
                  wire ? 'solid' : 'gradient" method="sigma" focus="0%',
                  VML_COLOR, shadowColor[0],
                  VML_OPACITY, so.toFixed(2),
                  VML_ANGLE, angle,
                  wire ? strokeProps(this, 1) : "",
                VML_END_SHAPE);
      }
    }
    rv.push(VML_SHAPE_AND_STYLE, zindex,
            VML_COORD, wire ? VML_STROKE : VML_FILL,
            VML_PATH, path,
              // brush
              wire ? VML_VSTROKE : VML_VFILL,
              wire ? VML_FILLTYPE_HEAD : VML_TYPE_HEAD,
              wire ? 'solid' : 'gradient" method="sigma" focus="0%',
              wire ? VML_COLOR : VML_COLORS,
              wire ? _addColorCache(this.xMissColor)[0] : color,
              VML_OPACITY, this[GLOBAL_ALPHA],
              '" o:opacity2="', this[GLOBAL_ALPHA], // fill only
              VML_ANGLE, angle,
              wire ? strokeProps(this, 1) : "",
            VML_END_SHAPE);
    return rv.join("");
  },

  _rfill: function(style, path, wire, mix, zindex, shadowColor) {
    var rv = [], brush, v,
        fp = style._param, fsize, fposX, fposY, focusParam = "",
        color = this._gcolor(style._colorStop),
        zindex2 = 0,
        x = fp.x1 - fp.r1,
        y = fp.y1 - fp.r1,
        r1x = fp.r1 * this._scaleX,
        r1y = fp.r1 * this._scaleY,
        c0 = this._map(x, y),
        // for shadow
        si = 0, siz = _shadowWidth, so = 0, sd = 0, sx = 0, sy = 0;

    // focus
    if (!wire) {
      fsize = (fp.r0 / fp.r1);
      fposX = (1 - fsize + (fp.x0 - fp.x1) / fp.r1) / 2; // forcus position x
      fposY = (1 - fsize + (fp.y0 - fp.y1) / fp.r1) / 2; // forcus position y
    }

    if (shadowColor[1]) {
      sx = _shadowWidth / 2 + this[SHADOW_OFFSET_X];
      sy = _shadowWidth / 2 + this[SHADOW_OFFSET_Y];
      so = 0.01; // shadow opacity from
      sd = 0.05; // shadow opacity delta

      if (wire) {
        siz = this[LINE_WIDTH];
        sd = 0.2 / siz; // opacity from 0.05 to 0.25
      }

      if (wire) {
        focusParam = [VML_VSTROKE, VML_FILLTYPE_HEAD, 'tile',
                      strokeProps(this, 1)].join("");
      } else {
        focusParam = [VML_VFILL, VML_TYPE_HEAD,
                      'gradientradial" method="sigma" focussize="',
                      fsize, ',', fsize,
                      '" focusposition="', fposX, ',', fposY].join("");
      }
      for (; si < siz; so += sd, --sx, --sy, ++si) {
        rv.push('<v:oval style="position:absolute;z-index:', zindex,
                ';left:', _round(c0.x / _zoom) + sx,
                'px;top:', _round(c0.y / _zoom) + sy,
                'px;width:', r1x, 'px;height:', r1y,
                'px', wire ? VML_STROKE : VML_FILL,
                '" coordsize="11000,11000',
                focusParam, VML_OPACITY, so.toFixed(2),
                VML_COLOR, shadowColor[0],
                '" /></v:oval>');
      }
    }

    if (wire) {
      // VML has not stroke gradient
      brush = [VML_VSTROKE, VML_FILLTYPE_HEAD, 'tile', strokeProps(this, 1),
               VML_OPACITY, this[GLOBAL_ALPHA],
               VML_COLOR, _addColorCache(this.xMissColor)[0]].join("");
    } else {
      // fill outside
      if (style._colorStop.length) {
        v = style._colorStop[0]; // 0 = outer color
        if (v.color[1] > 0.001) {
          if (mix === 4) { zindex2 = --this._zindex; }
          rv.push(VML_SHAPE_AND_STYLE, zindex2,
                  VML_FILL, VML_COORD, VML_PATH, path,
                  VML_VFILL, VML_TYPE_HEAD, 'solid',
                  VML_COLOR, v.color[0],
                  VML_OPACITY, v.color[1] * this[GLOBAL_ALPHA],
                  VML_END_SHAPE);
        }
      }
      brush = [VML_VFILL, VML_TYPE_HEAD,
               'gradientradial" method="sigma" focussize="',
               fsize , ',', fsize,
               '" focusposition="', fposX, ',', fposY,
               VML_OPACITY, this[GLOBAL_ALPHA],
               '" o:opacity2="', this[GLOBAL_ALPHA],
               VML_COLORS, color].join("");
    }
    rv.push('<v:oval style="z-index:', zindex, // !need! z-index
            ';position:absolute;left:', _round(c0.x / _zoom),
            'px;top:', _round(c0.y / _zoom),
            'px;width:', r1x, 'px;height:', r1y, 'px',
            wire ? VML_STROKE : VML_FILL,
            '" coordsize="11000,11000', brush,
            '" /></v:oval>');
    return rv.join("");
  },

  _pfill: function(style, path, wire, mix, zindex, shadowColor) {
    var rv = [],
        // for shadow
        si = 0, so = 0, sd = 0, sx = 0, sy = 0;

    if (shadowColor[1]) {
      sx = _shadowWidth / 2 + this[SHADOW_OFFSET_X];
      sy = _shadowWidth / 2 + this[SHADOW_OFFSET_Y];
      so = 0.01; // shadow opacity from
      sd = 0.05; // shadow opacity delta

      for (; si < _shadowWidth; so += sd, --sx, --sy, ++si) {
        rv.push(VML_SHAPE_AND_STYLE, zindex,
                ';left:', sx, 'px;top:', sy, 'px',
                VML_COORD,
                wire ? VML_STROKE : VML_FILL,
                VML_PATH, path,
                  // brush
                  wire ? VML_VSTROKE: VML_VFILL,
                  wire ? VML_FILLTYPE_HEAD : VML_TYPE_HEAD, 'solid',
                  wire ? strokeProps(this, 1) : "",
                  VML_COLOR, shadowColor[0],
                  VML_OPACITY, so.toFixed(2),
                VML_END_SHAPE);
      }
    }

    rv.push(VML_SHAPE_AND_STYLE, zindex,
            VML_COORD,
            wire ? VML_STROKE : VML_FILL,
            VML_PATH, path,
              // brush
              wire ? VML_VSTROKE : VML_VFILL,
              wire ? VML_FILLTYPE_HEAD : VML_TYPE_HEAD, 'tile',
              VML_OPACITY, this[GLOBAL_ALPHA],
              '" src="', style._src,
              wire ? strokeProps(this, 1) : "",
            VML_END_SHAPE);

    return rv.join("");
  },
//stroke:
  clip: function() {
    this._clipPath = this._clipRect + " x " + this._path.join("");
  },

  _clippy: function(vml) {
    return [vml, '<v:shape style="position:absolute;width:10px;height:10px',
            VML_FILL, VML_COORD, VML_PATH, this._clipPath,
            VML_VFILL, VML_TYPE_HEAD, 'solid', VML_COLOR, this.xClipStyle,
            VML_END_SHAPE].join("");
  },
//isPointInPath:
  // === Text ==============================================
  fillText: function(text, x, y, maxWidth, wire) {
    text = text.replace(/(\t|\v|\f|\r\n|\r|\n)/g, " ");
    var style = wire ? this[STROKE_STYLE] : this[FILL_STYLE],
        types = (typeof style === "string") ? 0 : style._type,
        rv = [], vml, align = this[TEXT_ALIGN], dir = "ltr", c,
        font = parseFont(this[FONT]),
        m = this._mtx, zindex = 0,
        fp, c0, c1, // for grad
        skew = [m[0].toFixed(3) + ',' + m[3].toFixed(3) + ',' +
                m[1].toFixed(3) + ',' + m[4].toFixed(3) + ',0,0'].join(""),
        skewOffset,
        delta = 1000, left = 0, right = delta,
        offset = { x: 0, y: 0 },
        // for shadow
        si = 0, so = 0, sd = 0, sx = 0, sy = 0,
        sc = _colorCache[this[SHADOW_COLOR]] ||
             _addColorCache(this[SHADOW_COLOR]);

    switch (COMPOSITES[this[GLOBAL_COMPO]]) {
    case  4: zindex = --this._zindex; break;
    case 10: this._clear();
    }

    switch (align) {
    case "end": dir = "rtl"; // break;
    case "start":
      align = this._elm.uuCSSDirection === dir ? "left" : "right"
    }
    switch (align) {
    case "center": left = right = delta / 2; break;
    case "right": left = delta, right = 0.05;
    }
    if (this[TEXT_BASELINE] === "top") {
      // text margin-top fine tuning
      offset.y = font.size /
          (FONT_SCALES[font.rawfamily.split(",")[0].toUpperCase()] ||
           this.xTextMarginTop);
    }
    skewOffset = this._map(x + offset.x, y + offset.y);

    if (sc[1] && !this.xShadowBlur &&
        (this[SHADOW_OFFSET_X] || this[SHADOW_OFFSET_Y])) {
      sx = _shadowWidth / 2 + this[SHADOW_OFFSET_X];
      sy = _shadowWidth / 2 + this[SHADOW_OFFSET_Y];
      so = 0.10; // shadow opacity from
      sd = 0.05; // shadow opacity delta

      for (; si < _shadowWidth; so += sd, --sx, --sy, ++si) {
        rv.push('<v:line',
                ' style="position:absolute;width:1px;height:1px;z-index:',
                zindex, ';left:', sx, 'px', ';top:', sy, 'px',
                VML_FILL, '" from="', -left, ' 0" to="', right,
                ' 0.05" coordsize="100 100">',
                '<v:fill color="', sc[0],
                '" opacity="', so.toFixed(2), '" />',
                '<v:skew on="t" matrix="', skew ,'" ',
                ' offset="', _round(skewOffset.x / _zoom), ',',
                             _round(skewOffset.y / _zoom),
                '" origin="', left ,' 0" />',
                '<v:path textpathok="t" />',
                '<v:textpath on="t" string="', toHTMLEntity(text),
                '" style="v-text-align:', align,
                ';font:', toHTMLEntity(font.formal),
                '" /></v:line>');
      }
    }

    rv.push('<v:line',
            ' style="position:absolute;width:1px;height:1px;z-index:',
            zindex,
            VML_FILL, '" from="', -left, ' 0" to="', right,
            ' 0.05" coordsize="100 100">');

    switch (types) {
    case 0:
      c = _colorCache[style] || _addColorCache(style);
      rv.push('<v:fill color="', c[0],
              '" opacity="', c[1] * this[GLOBAL_ALPHA], '" />');
      break;
    case 1:
    case 2:
      fp = style._param;
      c0 = this._map(fp.x0, fp.y0);
      c1 = this._map(fp.x1, fp.y1);
      rv.push('<v:fill type="gradient" method="sigma" focus="0%',
              VML_COLORS, this._gcolor(style._colorStop),
              VML_OPACITY, this[GLOBAL_ALPHA],
              '" o:opacity2="', this[GLOBAL_ALPHA],
              VML_ANGLE,
              _math.atan2(c1.x - c0.x, c1.y - c0.y) * _toDegrees,
              '" />');
      break;
    case 3:
      rv.push('<v:fill position="0,0" type="tile" src="',
              style._src, '" />');
      break;
    }
    rv.push('<v:skew on="t" matrix="', skew ,'" ',
            ' offset="', _round(skewOffset.x / _zoom), ',',
                         _round(skewOffset.y / _zoom),
            '" origin="', left ,' 0" />',
            '<v:path textpathok="t" />',
            '<v:textpath on="t" string="', toHTMLEntity(text),
            '" style="v-text-align:', align,
            ';font:', toHTMLEntity(font.formal),
            '" /></v:line>');
    vml = rv.join("");
    !this.xFlyweight &&
      this._history.push(this._clipPath ? (vml = this._clippy(vml)) : vml);
    this._elm.insertAdjacentHTML("beforeEnd", vml);
  },
//strokeText:
//measureText:
  // drawing images
  // drawImage(image, dx, dy)
  // drawImage(image, dx, dy, dw, dh)
  // drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh)
  drawImage: function(image) {
    var rv = [], vml = "", a = arguments, m,
        dx, dy, dw, dh, sx = 0, sy = 0, sw, sh, iw, ih, method = "scale",
        i = 0, iz, me = this, c0, zindex = 0,
        prefix = uu.ua.ieMode8 ? "-ms-filter:'" : "filter:", // filter prefix
        postfix = uu.ua.ieMode8 ? "'" : "",
        sizeTrans, // 0: none size transform, 1: size transform
        // for shadow
        si = 0, so = 0, sd = 0, shx = 0, shy = 0, shw = _shadowWidth,
        sc = _colorCache[this[SHADOW_COLOR]] ||
             _addColorCache(this[SHADOW_COLOR]);

    function trans(m, x, y, w, h) {
      var c1 = me._map(x, y),
          c2 = me._map(x + w, y),
          c3 = me._map(x + w, y + h),
          c4 = me._map(x, y + h);
      return ["padding:0 ",
              _round(_max(c1.x, c2.x, c3.x, c4.x) / _zoom), "px ",
              _round(_max(c1.y, c2.y, c3.y, c4.y) / _zoom), "px 0;",
              prefix, DX_PFX, ".Matrix(M11=", m[0], ",M12=", m[3],
                ",M21=", m[1], ",M22=", m[4],
                ",Dx=", _round(c1.x / _zoom),
                ",Dy=", _round(c1.y / _zoom), ")", postfix].join("");
    }

    switch (COMPOSITES[this[GLOBAL_COMPO]]) {
    case  4: zindex = --this._zindex; break;
    case 10: this._clear();
    }

    iw = image.width;
    ih = image.height;

    switch (a.length) {
    case 3: dx = a[1], dy = a[2], dw = iw, dh = ih,
            sw = iw, sh = ih, method = "image"; break;
    case 5: dx = a[1], dy = a[2], dw = a[3], dh = a[4],
            sw = iw, sh = ih; break;
    case 9: dx = a[5], dy = a[6], dw = a[7], dh = a[8],
            sx = a[1], sy = a[2], sw = a[3], sh = a[4]; break;
    default: throw "";
    }

    if ("src" in image) { // image is HTMLImageElement
      c0 = this._map(dx, dy);
      sizeTrans = (sx || sy); // 0: none size transform, 1: size transform

      if (sc[1]) {
        shx = shw / 2 + this[SHADOW_OFFSET_X];
        shy = shw / 2 + this[SHADOW_OFFSET_Y];
        so = 0.01; // shadow opacity from
        sd = 0.05; // shadow opacity delta

        for (; si < shw; so += sd, --shx, --shy, ++si) {
          if (this._efx) {
            rv.push('<div style="z-index:', zindex - 10,
                    ';left:', shx, 'px;top:', shy, 'px',
                    ';position:absolute;',
                    trans(this._mtx, dx, dy, dw, dh), '">');
          } else {
            rv.push('<div style="z-index:', zindex - 10,
                    ';position:absolute;', // 1:1 scale
                    "top:", _round(c0.y / _zoom) + shx,
                    "px;left:", _round(c0.x / _zoom) + shy, "px", '">')
          }
          rv.push('<div style="position:relative;overflow:hidden;width:',
                  _round(dw), 'px;height:', _round(dh), 'px">');

          if (sizeTrans) {
            rv.push('<div style="width:',  _ceil(dw + sx * dw / sw), 'px;',
                    'height:', _ceil(dh + sy * dh / sh), 'px;',
                    prefix, DX_PFX,
                    '.Matrix(Dx=', -sx * dw / sw, ',Dy=', -sy * dh / sh, ')',
                    postfix, '">');
          }
          rv.push('<div style="width:',  _round(iw * dw / sw), 'px;',
                  'height:', _round(ih * dh / sh),
                  'px;background-color:', sc[0], ';',
                  prefix, DX_PFX, '.Alpha(opacity=', so * 100, ')', postfix,
                  '"></div>');
          rv.push(sizeTrans ? "</div>" : "", "</div></div>");
        }
      }

      if (this._efx) {
        rv.push('<div style="z-index:', zindex, ';position:absolute;',
//prefix, DX_PFX, '.Alpha(opacity=', this[GLOBAL_ALPHA] * 100, ')', postfix, ';',
                trans(this._mtx, dx, dy, dw, dh), '">');
      } else { // 1:1 scale
        rv.push('<div style="z-index:', zindex, ';position:absolute;',
//prefix, DX_PFX, '.Alpha(opacity=', this[GLOBAL_ALPHA] * 100, ')', postfix, ';',
                "top:", _round(c0.y / _zoom), "px;left:",
                _round(c0.x / _zoom), "px", '">')
      }
      rv.push('<div style="position:relative;overflow:hidden;width:',
                           _round(dw), 'px;height:', _round(dh), 'px">');

      if (sizeTrans) {
        rv.push('<div style="width:',  _ceil(dw + sx * dw / sw), 'px;',
                            'height:', _ceil(dh + sy * dh / sh), 'px;',
                prefix, DX_PFX,
                '.Matrix(Dx=', -sx * dw / sw, ',Dy=', -sy * dh / sh, ')',
                postfix, '">');
      }
      rv.push('<div style="width:',  _round(iw * dw / sw), 'px;',
                          'height:', _round(ih * dh / sh), 'px;',
              prefix, DX_PFX, '.AlphaImageLoader(src=',
              image.src, ',SizingMethod=',
              method, ')', postfix, '"></div>');
      rv.push(sizeTrans ? "</div>" : "", "</div></div>");
      vml = rv.join("");
    } else {
      c0 = this._map(dx, dy);
      switch (a.length) {
      case 3: // 1:1 scale
              rv.push('<div style="z-index:', zindex, ';position:absolute;',
                      "top:", _round(c0.y / _zoom), "px;left:",
                      _round(c0.x / _zoom), "px", '">')
              iz = image._ctx2d._history.length;

              for (; i < iz; ++i) {
                rv.push(image._ctx2d._history[i]);
              }
              rv.push('</div>');
              break;
      case 5:
              m = _matrix.multiply(_matrix.scale(dw / iw, dh / ih), this._mtx);
              rv.push('<div style="z-index:', zindex, ';position:absolute;',
                      trans(m, dx, dy, dw, dh), '">');
              rv.push('<div style="width:',  _round(iw * dw / sw), 'px;',
                                  'height:', _round(ih * dh / sh), 'px;">');
              iz = image._ctx2d._history.length;

              for (; i < iz; ++i) {
                rv.push(image._ctx2d._history[i]);
              }
              rv.push('</div></div>');
              break;
      case 9: // buggy(not impl)
              m = _matrix.multiply(_matrix.scale(dw / sw, dh / sh), this._mtx);
  //          m = _matrix.multiply(_matrix.translate(dx, dy), m);
              rv.push('<div style="z-index:', zindex,
                      ';position:absolute;overflow:hidden;',
                      trans(m, dx, dy, dw, dh), '">');

              iz = image._ctx2d._history.length;

              for (; i < iz; ++i) {
                rv.push(image._ctx2d._history[i]);
              }
              rv.push('</div>');
              break;
      }
      vml = rv.join("");
/*
      // effect CSS::opacity and filter::opacity
      vml = vml.replace(/opacity=\"([\d\.]+)\"/g, function(m, opa) {
        return 'opacity="' + (opa * me[GLOBAL_ALPHA]).toFixed(3) + '"';
      }).replace(/opacity=([\d\.]+)/g, function(m, opa) {
        return 'opacity=' + (opa * me[GLOBAL_ALPHA]).toFixed(3);
      });
 */
    }
    !this.xFlyweight &&
      this._history.push(this._clipPath ? (vml = this._clippy(vml)) : vml);
    this._elm.insertAdjacentHTML("beforeEnd", vml);
  },

  // === Pixel manipulation ================================
//createImageData:
//getImageData:
//putImageData:
  // === Gradient ==========================================
  createLinearGradient: function(x0, y0, x1, y1) {
    return new Grad(1, // 1:gradient
                    { x0: x0, y0: y0, x1: x1, y1: y1 }, 1);
  },

  createRadialGradient: function(x0, y0, r0, x1, y1, r1) {
    return new Grad(2, // 2:gradientradial
                    { x0: x0, y0: y0, r0: r0, x1: x1, y1: y1, r1: r1 }, 1);
  },

  createPattern: function(image, repetition) {
    return new Patt(image, repetition);
  },

  // build Gradation Color
  _gcolor: function(ary) {
    var rv = [], i = 0, iz = ary.length;
    for (; i < iz; ++i) {
      rv.push(ary[i].offset + " " + ary[i].color[0]);
    }
    return rv.join(",");
  }
};
uu.mix(VML2D.prototype, _prototypes);

// --- initialize ---
function initCanvas() {
  var lc = /loaded|complete/, rs = "readyState", ns = _doc.namespaces, fn,
      be = "{behavior:url(" + VML_NSV + ")}";

  if (!_ie) {
    if (_doc.getElementsByTagName("canvas").length) { // window.loaded state
      ++_canvasReady;
    } else if (uu.ua.opera) {
      addEventListener("load", function() {
        ++_canvasReady;
      }, false);
    } else if (uu.ua.webkit && _doc[rs]) {
      fn = function() {
        lc.test(_doc[rs]) ? ++_canvasReady : setTimeout(fn, 0);
      };
      fn();
    } else if (uu.ua.gecko) {
      _doc.addEventListener("DOMContentLoaded", function() {
        ++_canvasReady;
      }, false);
    } else {
      ++_canvasReady;
    }
    return;
  }
  // --- IE part ---
  if (!ns["v"]) {
    ns.add("v", VML_NS + "vml", VML_NSV);
    ns.add("o", VML_NS + "office:office", VML_NSV);
  }
  _doc.createStyleSheet().cssText =
    "canvas{display:inline-block;text-align:left;width:300px;height:150px}" +
    "v\:oval,v\:shape,v\:stroke,v\:fill,v\:textpath" + be +
    "v\:line,v\:skew,v\:path,o\:opacity2" + be;

  function initIE() {
    var v, node = _doc.getElementsByTagName("canvas"), i = node.length;
    while (i--) {
      v = node[i];
      uuCanvas.init(node[i], 
          (!uu.ua.ag || (" " + v.className + " ").indexOf(" vml ") >= 0));
    }
    ++_canvasReady;
  }

  _doc.createElement("canvas"); // dummy
  if (lc.test(_doc[rs])) { // DOM already
    initIE();
  } else {
    _doc.attachEvent("onreadystatechange", function() {
      lc.test(_doc[rs]) && initIE();
    });
  }
};

// --- export ---
uuCanvas.Ag2D = Ag2D;
uuCanvas.VML2D = VML2D;
uuCanvas.already = function() { return !!_canvasReady; };
uuCanvas.clearColorCache = function() { _colorCache = {}; };
if (_ie) {
  _win.CanvasRenderingContext2D = function() {};
  _win.CanvasGradient = Grad;
  _win.CanvasPattern = Patt;
}
initCanvas(); // initialize

// === Extend API ==========================================
// - setShadow()
// - getShadow()
function _setShadow(me,      // @param this:
                    color,   // @param ColorString: shadow color
                    offsetX, // @param Number: offset X
                    offsetY, // @param Number: offset X
                    blur) {  // @param Number: blur
  me[SHADOW_COLOR] = color;
  me[SHADOW_OFFSET_X] = offsetX;
  me[SHADOW_OFFSET_Y] = offsetY;
  me[SHADOW_BLUR] = blur;
  // Firefox3.0 doesn't maintain the shaodw parameters.
  //    ctx.shadowColor = "gray";
  //    ctx.shadowBlur = 4;
  //    alert(ctx.shadowColor)  ->  "null"
  //    alert(ctx.shadowBlur)   ->  0
  me._shadow = [color, offsetX, offsetY, blur]
}

function _getShadow(me) { // @return Hash: { shadowColor, shadowOffsetX,
                          //                 shadowOffsetY, shadowBlur }
  return {
    shadowColor:   me[SHADOW_COLOR]    || me._shadow[0],
    shadowOffsetX: me[SHADOW_OFFSET_X] || me._shadow[1],
    shadowOffsetY: me[SHADOW_OFFSET_Y] || me._shadow[2],
    shadowBlur:    me[SHADOW_BLUR]     || me._shadow[3]
  };
}

if (_ie) {
  uu.mix(Ag2D.prototype, {
    setShadow: function(color, offsetX, offsetY, blur) {
      _setShadow(this, color, offsetX, offsetY, blur);
    },
    getShadow: function() {
      return _getShadow();
    }
  });
  uu.mix(VML2D.prototype, {
    setShadow: function(color, offsetX, offsetY, blur) {
      _setShadow(this, color, offsetX, offsetY, blur);
    },
    getShadow: function() {
      return _getShadow();
    }
  });
} else {
  // wrapper
  _canvasProp._save = _canvasProp.save;
  _canvasProp._restore = _canvasProp.restore;

  uu.mix(_canvasProp, {
    _shadow: [TRANSPARENT, 0, 0, 0],
    _stack: [],
    save: function() {
      this._stack.push([this[FONT], this[TEXT_ALIGN], this[TEXT_BASELINE],
                        uu.mix([], this._shadow)]);
      this._save();
    },
    restore: function() {
      this._restore();
      if (this._stack.length) { // for Opera9.5+, Firefox2, Firefox3
        var last = this._stack.pop();
        this[FONT] = last[0];
        this[TEXT_ALIGN] = last[1];
        this[TEXT_BASELINE] = last[2];
        this._shadow = last[3];
      }
    },
    setShadow: function(color, offsetX, offsetY, blur) {
      _setShadow(this, color, offsetX, offsetY, blur);
    },
    getShadow: function() {
      return _getShadow();
    }
  });
}

// === Extend Text API =====================================
// for Opera9.5+, Opera10.0, Firefox2, Firefox3, Chrome1+
// - fillText()
// - strokeText()
// - measureText()
// - unsupported shadow
// - unsupported pattern
// - unsupported gradation
// - unsupported matrix transform
if ((uu.ua.gecko && uu.ua.ver <= 3) ||
    (uu.ua.opera && uu.ua.ver <= 10)) {

  // wrapper
  _canvasProp._clearRect = _canvasProp.clearRect;
  _canvasProp.xAutoTextRender = 1; // 1 = auto;

  uu.mix(_canvasProp, {
    textAlign: "start",
    textBaseling: "top",
    xMissColor: "#000",
    clearRect: function(x, y, w, h) {
      var fn = clearRectDOM;
      if (this.xAutoTextRender) {
        if (uu.ua.gecko && uu.ua.ver === 3) {
          fn = clearRectMoz;
        } else if (uu.ua.opera && uu.ua.ver <= 10) {
          fn = clearRectSVG;
        }
      }
      fn(this, x, y, w, h);
    },
    fillText: function(text, x, y, maxWidth, wire) {
      var fn = fillTextDOM;
      if (this.xAutoTextRender) {
        if (uu.ua.gecko && uu.ua.ver === 3) {
          fn = fillTextMoz;
        } else if (uu.ua.opera && uu.ua.ver <= 10) {
          fn = fillTextSVG;
        }
      }
      fn(this, text, x, y, maxWidth, wire);
    },
    strokeText: function(text, x, y, maxWidth) {
      this.fillText(text, x, y, maxWidth, 1);
    },
    measureText: function(text) {
      var metric = getTextMetric(text, this[FONT]);
      return new TextMetrics(metric.w, metric.h);
    }
  });
} else if (uu.ua.chrome && uu.ua.ver <= 2) {
  _canvasProp.strokeText = function(text, x, y, maxWidth) {
    this.save();
    this[FILL_STYLE] = this[STROKE_STYLE];
    this.fillText(text, x, y, maxWidth);
    this.restore();
  }
}

function clearTextView(me) {
  var i = 1, iz = me.canvas.uuCanvasTextView.length;
  for (; i < iz; ++i) {
    me.canvas.uuCanvasTextView[i][uu.innerText] = "";
  }
}

function clearRectMoz(me, x, y, w, h) {
  me._clearRect(x, y, w, h);
}

function clearRectDOM(me, x, y, w, h) {
  if (me.canvas.uuCanvasTextView &&
      !x && !y && w == me.canvas.width && h == me.canvas.height) {
    clearTextView(me);
  }
  me._clearRect(x, y, w, h);
}

function clearRectSVG(me, x, y, w, h) {
  me._clearRect(x, y, w, h);
}

function fillTextMoz(me, text, x, y, maxWidth, wire) {
  var align = me[TEXT_ALIGN], dir = "ltr",
      metric = getTextMetric(text, me[FONT]),
      offX = 0, offY = 0,
      // for shadow
      si = 0, so = 0, sd = 0,
      sc = _colorCache[me._shadow[0]] ||
           _addColorCache(me._shadow[0]);

  switch (align) {
  case "end": dir = "rtl"; // break;
  case "start":
    align = uu.style(me.canvas).direction === dir ? "left" : "right"
  }
  if (align === "center") {
    offX = metric.w / 2;
  } else if (align === "right") {
    offX = metric.w;
  }
  offY = (metric.h + metric.h / 2) / 2; // emulate textBaseLine="top"

  me.save();
  me[GLOBAL_COMPO] = "source-over";
  me.mozTextStyle = me.font;
  me.translate(x - offX, y + offY);
  if (wire) {
    me[FILL_STYLE] = me[STROKE_STYLE];
  }

  if (sc[1] && (me._shadow[1] || me._shadow[2])) {
    so = 0.10; // shadow opacity from
    sd = 0.05; // shadow opacity delta

    me.save();
    me.translate(_shadowWidth / 2 + me._shadow[1],
                 _shadowWidth / 2 + me._shadow[2]);
    for (; si < _shadowWidth; so += sd, ++si) {
      me.translate(-1, -1);
      me[GLOBAL_ALPHA] = so.toFixed(2);
      me[FILL_STYLE] = sc[0];
      me.mozDrawText(text);
    }
    me.restore();
  }

  me.mozDrawText(text);
  // http://d.hatena.ne.jp/uupaa/20090506/1241572019
  me.fillRect(0,0,0,0); // force redraw(Firefox3.0 bug)
  me.restore();
}

function fillTextDOM(me, text, x, y, maxWidth, wire) {
  var canvas = me.canvas, // HTMLCanvasElement
      view, layer, sc, name,
      offX = 0, metric, align = me[TEXT_ALIGN], dir = "ltr";

  if (canvas.uuCanvasLayerView) {
    view = canvas.uuCanvasLayerView._view;
    canvas.uuCanvasTextView = [view];
  } else if (!canvas.uuCanvasTextView) {
//  view = canvas.parentNode.appendChild(_doc.createElement("div"));
    view = _doc.body.appendChild(_doc.createElement("div"));
    view.style.position = "absolute";
    view.style.overflow = "hidden";
    canvas.uuCanvasTextView = [view];

    // reposition
    function repos(attr) {
      function getPos(elm) {
        var x = 0, y = 0, r;
        if (elm.getBoundingClientRect) {
          r = elm.getBoundingClientRect();
          x = r.left + pageXOffset;
          y = r.top  + pageYOffset;
        } else {
          while (elm) {
            x += elm.offsetLeft || 0;
            y += elm.offsetTop  || 0;
            elm = elm.offsetParent;
          }
        }
        return { x: x, y: y };
      }

      try {
        var rect, style = uu.style(me.canvas);
        if (attr & 1) {
          rect = getPos(me.canvas);
        } else {
          rect = { x: _int(style.left), y: _int(style.top) };
        }
        uu.mix(me.canvas.uuCanvasTextView[0].style, {
//        zIndex: (_int(style.zIndex) || 0) + 1, // Fx2"auto" -> 1
          height: _int(canvas.height) + "px",
          width: _int(canvas.width) + "px",
          left: rect.x + "px",
          top: rect.y + "px",
          visibility: style.visibility,
          display: style.display,
          opacity: _float(style.opacity)
        });
        if (!uu.ua.gecko) {
          uu.mix(me.canvas.uuCanvasTextView[0].style, {
            zIndex: (_int(style.zIndex) || 0) + 1
          });
        }
      } catch (err) {}
    }
    function onAttr(evt) {
      var attr = HIT_PROPS2[evt.attrName] || 0;
      if (attr) {
        (attr & 1) && clearTextView(me); // clear
        repos(attr);
      }
    }
    repos(3);
    canvas.addEventListener("DOMAttrModified", onAttr, false);
    setInterval(function() { repos(3); }, 1000); // delay 1sec
  } else {
    view = canvas.uuCanvasTextView[0];
  }
  // Firefox2: shadowColor is always null(read only prop?)
  if (uu.ua.gecko) {
    sc = ["#000000", 0];
  } else {
    sc = _colorCache[me[SHADOW_COLOR]] ||
         _addColorCache(me[SHADOW_COLOR]);
  }

  metric = getTextMetric(text, me[FONT]);
  switch (align) {
  case "end": dir = "rtl"; // break;
  case "start":
    align = uu.style(me.canvas).direction === dir ? "left" : "right"
  }
  if (align === "center") {
    offX = metric.w / 2;
  } else if (align === "right") {
    offX = metric.w;
  }

  layer = view.appendChild(_doc.createElement("div"));
  uu.mix(layer.style, {
    font: me[FONT],
    position: "absolute",
    opacity: me[GLOBAL_ALPHA],
    height: _int(metric.h * 1.2) + "px",
    width: _int(metric.w * 1.2) + "px", // avoid word wrap
    left: (x - offX) + "px",
    top: y + "px" 
  });

  if (sc[1] && (me[SHADOW_OFFSET_X] || me[SHADOW_OFFSET_Y])) {
    layer.style.textShadow = [me[SHADOW_OFFSET_X] + "px",
                              me[SHADOW_OFFSET_Y] + "px",
                              me[SHADOW_BLUR] + "px",
                              me[SHADOW_COLOR]].join(" ");
  }
  name = wire ? STROKE_STYLE : FILL_STYLE;
  if (typeof me[name] === "string") {
    layer.style.color = me[name];
  }
  layer[uu.innerText] = text;
  canvas.uuCanvasTextView.push(layer);
}

function fillTextSVG(me, text, x, y, maxWidth, wire) {
  text = text.replace(/(\t|\v|\f|\r\n|\r|\n)/g, " ");

  function svge(name) {
    return _doc.createElementNS("http://www.w3.org/2000/svg", name);
  }
  function filter(svg, sx, sy, sb, sc) {
    var e = [];
    svg.appendChild(e[0] = svge("defs"));
      e[0].appendChild(e[1] = svge("filter"));
        e[1].appendChild(e[2] = svge("feGaussianBlur"));
        e[1].appendChild(e[3] = svge("feOffset"));
        e[1].appendChild(e[4] = svge("feBlend"));
    e[1].setAttribute("id", "dropshadow");
    e[1].setAttribute("filterUnits", "userSpaceOnUse");
    e[2].setAttribute("in", "SourceGraphic");
    e[2].setAttribute("result", "blurout");
    e[2].setAttribute("stdDeviation", sb / 2);
    e[3].setAttribute("in", "blurout");
    e[3].setAttribute("result", "offsetBlur");
    e[3].setAttribute("dx", sx);
    e[3].setAttribute("dy", sy);
    e[4].setAttribute("in", "SourceGraphic");
    e[4].setAttribute("in2", "offsetBlur");
    e[4].setAttribute("mode", "normal");
  }
  var style = wire ? me[STROKE_STYLE] : me[FILL_STYLE],
      types = (typeof style === "string") ? 0 : style._type,
      align = me[TEXT_ALIGN],
      dir = uu.style(me.canvas).direction === "ltr",
      font = parseFont(me[FONT]),
      metric = getTextMetric(text, me[FONT]),
      svg = svge("svg"),
      txt = svge("text"), txt2, 
      sc = _colorCache[me[SHADOW_COLOR]] ||
           _addColorCache(me[SHADOW_COLOR]),
      offset = { x: 0, y: 0 }, margin = 100,
      validFontFamily;

  switch (align) {
  case "left":  align = "start"; break;
  case "center": align = "middle"; break;
  case "right": align = "end"; break;
  case "start": align = dir ? "start" : "end"; break;
  case "end": align = dir ? "end" : "start";
  }
  switch (align) {
  case "middle": offset.x = metric.w / 2; break;
  case "end": offset.x = metric.w;
  }
  if (me[TEXT_BASELINE] === "top") {
    // text margin-top fine tuning
    offset.y = font.size /
        (FONT_SCALES[font.rawfamily.split(",")[0].toUpperCase()] ||
         me.xTextMarginTop);
  }
  svg.setAttribute("width",  metric.w + margin);
  svg.setAttribute("height", metric.h + margin);

  if (sc[1] && (me[SHADOW_OFFSET_X] || me[SHADOW_OFFSET_Y])) {
    filter(svg, me[SHADOW_OFFSET_X], me[SHADOW_OFFSET_Y],
           me[SHADOW_BLUR], sc);
    txt2 = svge("text");
    txt2.setAttribute("text-anchor", align);
    txt2.setAttribute("x", 0 + margin / 2 + offset.x);
    txt2.setAttribute("y", offset.y + offset.y / 2.4 + margin / 2);
    txt2.setAttribute("fill", sc[0]);
    txt2.setAttribute("opacity", sc[1] * me[GLOBAL_ALPHA] / 1.5); // 1.5=fuzzy
    txt2.setAttribute("font-style", font.style);
    txt2.setAttribute("font-variant", font.variant);
    txt2.setAttribute("font-size", font.size + "px");
    txt2.setAttribute("font-weight", font.weight);
    txt2.setAttribute("font-family", font.family);
    txt2.setAttribute("filter", "url(#dropshadow)");
    svg.appendChild(txt2);
    txt2.appendChild(_doc.createTextNode(text));
  }
  txt.setAttribute("text-anchor", align);
  txt.setAttribute("x", 0 + margin / 2 + offset.x);
  txt.setAttribute("y", offset.y + offset.y / 2.4 + margin / 2);
  txt.setAttribute("fill", !types ? style : me.xMissColor);
  txt.setAttribute("font-style", font.style);
  txt.setAttribute("font-variant", font.variant);
  txt.setAttribute("font-size", font.size + "px");
  txt.setAttribute("font-weight", font.weight);
  txt.setAttribute("font-family", font.family);
  validFontFamily = txt.getAttribute("font-family");
  if (!validFontFamily.replace(/[\"\']/g, "")) {
    return; // Opera9.5, Opera9.6 buggy
  }
  svg.appendChild(txt);
  txt.appendChild(_doc.createTextNode(text));

  _doc.body.appendChild(svg);
  me.save();
  me[GLOBAL_COMPO] = "source-over";
  me.drawImage(svg, x - margin / 2 - offset.x, y - margin / 2);
  me.restore();
  _doc.body.removeChild(svg);
}
})();

// === uuCanvas.Layer ======================================
function createGlossyData(gcolo1, gcolor2, overlayAlpha) {
  return { gcolor1: gcolo1, gcolor2: gcolor2, overlayAlpha: overlayAlpha };
}

uuCanvas.Layer = function(view,     // @param Node(= document.body): view
                          width,    // @param Number(= 300): view width
                          height) { // @param Number(= 150): view height
  // public property
  this.view = view || _doc.body;

  // private property
  this._layer = {}; // Hash ( { node: node, disp: "block", ctx: Object } )
  this._layerSize = 0;
  this._stack = [];     // context stack
  this._cid = void 0;   // current context id
  this._cctx = void 0;  // current context
  uu.mix(this.view.style, {
    zIndex: _int(uu.style(this.view).zIndex) || 0,
    position: "relative",
    overflow: "hidden",
    width: (width || 300) + "px",
    height: (height || 150) + "px"
  });
};

uuCanvas.Layer.prototype = {
  // uuCanvas.Layer.preset - preset data
  preset: {
    GBLACK: createGlossyData("#000",    "#333",    0.25),
    GGRAY:  createGlossyData("black",   "silver",  0.38),
    GSLIVER:createGlossyData("gray",    "white",   0.38),
    GBLUE:  createGlossyData("#0000a0", "#0097ff", 0.38),
    GGREEN: createGlossyData("#006400", "#00ff00", 0.38),
    GRED:   createGlossyData("#400000", "#ff0000", 0.38),
    GLEMON: createGlossyData("#dfcc00", "#FFE900", 0.38),
    GGOLD:  createGlossyData("#fffacd", "gold",    0.45), // lemonchiffon
    GPEACH: createGlossyData("violet",  "red",     0.38),
    GBLOODORANGE: createGlossyData("orange", "red", 0.38)
  },

  // uuCanvas.Layer.setPresetData - set preset data
  setPresetData: function(name,   // @param String: preset name
                          hash) { // @param Hash: preset data
                                  // @return this:
    this.preset[name.toString()] = hash;
    return this;
  },

  // uuCanvas.Layer.addNode - add div layer
  addNode: function(id,       // @param String: layer id
                    width,    // @param Number(= view width): width
                    height) { // @param Number(= view height): height
                              // @return this:
    var div = this.view.appendChild(_doc.createElement("div")),
        z = _int(uu.style(this.view).zIndex) - (++this._layerSize * 10);

    uu.mix(div.style, {
      zIndex: z,
      top: "0px",
      left: "0px",
      width: _int(width  || this.view.style.width) + "px",
      height: _int(height || this.view.style.height) + "px",
      display: "none", // hide
      position: "absolute"
    });
    this._layer[id] = { node: div, disp: "block", ctx: 0 };
    return this;
  },

  // uuCanvas.Layer.addCanvas - add canvas layer
  addCanvas: function(id,         // @param String: layer id
                      width,      // @param Number(= view width): width
                      height,     // @param Number(= view height): height
                      __vml__) {  // @param Boolean(= false): hidden arg
                                  // @return this:
    var canvas = this.view.appendChild(_doc.createElement("canvas")),
        z = _int(uu.style(this.view).zIndex) - (++this._layerSize * 10),
        ctx;
    canvas.width = _int(width || this.view.style.width);
    canvas.height = _int(height || this.view.style.height);
    canvas = uuCanvas.init(canvas, __vml__);
    uu.mix(canvas.style, {
      zIndex: z,
      top: "0px",
      left: "0px",
      display: "none", // hide
      position: "absolute"
    });
    // get 2D context
    ctx = canvas.getContext("2d");
    ctx.textBaseline = "top"; // force setting

    this._layer[id] = {
      node: canvas,
      // Firefox2 'display: inline-block' unsupported
      disp: (uu.ua.gecko && uu.ua.ver < 3) ? "block" : "inline-block",
      ctx: ctx
    };
    // set current context
    this._cid = id;
    this._cctx = this._layer[this._cid].ctx;
    return this;
  },

  // uuCanvas.Layer.addVMLCanvas - add VML canvas node layer
  addVMLCanvas: function(id,       // @param String: layer id
                         width,    // @param Number(= view width): width
                         height) { // @param Number(= view height): height
                                   // @return this:
    return this.addCanvas(id, width, height, 1);
  },

  // uuCanvas.Layer.remove - remove layer
  remove: function(id) { // @param String: layer id
                         // @return this:
    if (id in this._layer) {
      var node = this._layer[id].node;
      node.parentNode.removeChild(node);
      delete this._layer[id];
      --this._layerSize;
    }
    return this;
  },

  // uuCanvas.Layer.node - refer layer node
  node: function(id) { // @param String: layer id, 0 is current layer
                       // @return Node/undefined: layer element
    return this._layer[id].node;
  },

  // uuCanvas.Layer.size - get layer size
  size: function() { // @return Number:
    return this._layerSize;
  },

  // uuCanvas.Layer.front - get front layer element
  front: function() { // @return String: layer id
    var rv, id, ly = this._layer, z1 = -100, z2;
    for (id in ly) {
      z2 = _int(ly[id].node.style.zIndex) || 0;
      (z1 <= z2 || rv === void 0) && (z1 = z2, rv = id);
    }
    return rv;
  },

  // uuCanvas.Layer.rear - get rear layer element
  rear: function() { // @return String: layer id
    var rv, id, ly = this._layer, z1 = 0, z2;
    for (id in ly) {
      z2 = _int(ly[id].node.style.zIndex) || 0;
      (z1 >= z2 || rv === void 0) && (z1 = z2, rv = id);
    }
    return rv;
  },

  // uuCanvas.Layer.show - show layer
  //   show() is show all layer
  //   show("a") is show layer "a"
  show: function(id,         // @param String(= ""): layer id, "" is all layer
                 __hide__) { // @param Boolean(= false): hidden arg
                             // @return this:
    var i, ly = this._layer;

    if (!id) {
      for (i in ly) {
        ly[i].node.style.display = __hide__ ? "none" : ly[i].disp;
      }
    } else {
      ly[id].node.style.display = __hide__ ? "none" : ly[id].disp;
    }
    return this;
  },

  // uuCanvas.Layer.hide - hide layer
  hide: function(id) { // @param String: layer id
                       // @return this:
    return this.show(id, 1);
  },

  // uuCanvas.Layer.pos - set absolute/relative layer position
  pos: function(id,     // @param String(= ""): layer id, "" is all layer
                x,      // @param Number: style.left value(unit px)
                y,      // @param Number: style.top value(unit px)
                diff) { // @param Boolean(= true): difference,
                        //                false = x and y is absolute value
                        //                true = x and y is relative value
                        // @return this:
    x = _int(x), y = _int(y), diff = (diff === void 0) ? true : diff;
    var i, ly = this._layer, pixel = _ie || uu.ua.opera;

    function act(st) {
      if (pixel) {
        st.pixelLeft = (diff ? st.pixelLeft : 0) + x;
        st.pixelTop  = (diff ? st.pixelTop  : 0) + y;
      } else {
        st.left = (diff ? _int(st.left) : 0) + x + "px";
        st.top  = (diff ? _int(st.top)  : 0) + y + "px";
      }
    }

    if (!id) {
      for (i in ly) {
        act(ly[i].node.style);
      }
    } else {
      act(ly[id].node.style);
    }
    return this;
  },

  // uuCanvas.Layer.getOpacity - get layer opacity value(from 0.0 to 1.0)
  getOpacity: function(id) { // @param String: layer id
                             // @return Number: float value(min: 0.0, max: 1.0)
    var elm = this._layer[id].node;
    if (_ie) {
      return elm.filters.alpha ? elm.style.opacity : 1.0;
    }
    return _float(uu.style(elm).opacity);
  },

  // uuCanvas.Layer.setOpacity - set layer opacity value(from 0.0 to 1.0)
  setOpacity: function(id,      // @param String(= ""): layer id,
                                //                      "" is all layer
                       opacity, // @param Number(= 1.0): float value(0.0 to 1.0)
                       diff) {  // @param Boolean(= true):
                                // @return this:
    diff = (diff === void 0) ? true : diff;
    var i, ly = this._layer,
        opa = _float(opacity === void 0 ? 1.0 : opacity);

    function act(node) {
      var st = node.style;
      if (diff) {
        opa = (_ie ? (node.filters.alpha ? st.opacity : 1.0)
                   : _float(uu.style(node).opacity)) + opa;
      }
      if (opa > 0.999) {
        opa = 1;
      } else if (opa < 0.001) {
        opa = 0;
      }
      st.opacity = opa;
      if (_ie) {
        if (!node.filters.alpha) {
          st.filter += " alpha(opacity=0)";
          st.zoom = st.zoom || "1"; // IE6, IE7: force "hasLayout"
        }
        node.filters.alpha.opacity = opa * 100;
      }
    }

    if (!id) {
      for (i in ly) {
        act(ly[i].node);
      }
    } else {
      act(ly[id].node);
    }
    return this;
  },

  // --- canvas 2D context operation ---
  // uuCanvas.Layer.push - push current context
  push: function(id) { // @param String: layer id
                       // @return this:
    this._stack.push(this._cid);
    this._cid = id;
    this._cctx = this._layer[this._cid].ctx;
    return this;
  },

  // uuCanvas.Layer.ctx - refer current context
  ctx: function() { // @return CanvasRenderingContext2D:
    return this._cctx;
  },

  // uuCanvas.Layer.pop - pop current context
  pop: function() { // @param String: layer id
                    // @return this:
    if (this._stack.length) {
      this._cid = this._stack.pop();
      this._cctx = this._layer[this._cid].ctx;
    }
    return this;
  },

  // --- canvas 2D operation ---
  // uuCanvas.Layer.setAlpha - set globalAlpha
  //    globalAlpha: from 0.0 to 1.0
  setAlpha: function(alpha) { // @param Number: globalAlpha
                              // @return this:
    this._cctx.globalAlpha = alpha;
    return this;
  },

  // uuCanvas.Layer.setFill - set fillStyle
  setFill: function(style) { // @param String/Object: fillStyle
                             // @return this:
    this._cctx.fillStyle = style;
    return this;
  },

  // uuCanvas.Layer.setStroke - set strokeStyle
  setStroke: function(style) { // @param String/Object: strokeStyle
                               // @return this:
    this._cctx.strokeStyle = style;
    return this;
  },

  // uuCanvas.Layer.setLine - set line style
  //    lineWidth: from 1.0
  //    lineCap: "butt", "round", "square"
  //    lineJoin: "round", "bevel", "miter"
  //    miterLimit: from 1.0
  setLine: function(width,   // @param Number(= undefined): lineWidth
                    cap,     // @param String(= undefined): lineCap
                    join,    // @param String(= undefined): lineJoin
                    limit) { // @param Number(= undefined): miterLimit
                             // @return this:
    var ctx = this._cctx;
    (width !== void 0) && (ctx.lineWidth = width);
    (cap   !== void 0) && (ctx.lineCap = cap);
    (join  !== void 0) && (ctx.lineJoin = join);
    (limit !== void 0) && (ctx.miterLimit = limit);
    return this;
  },

  // uuCanvas.Layer.setLine - set shadow style
  setShadow: function(color,   // @param String(= undefined): shadowColor
                      offsetX, // @param Number(= undefined): shadowOffsetX
                      offsetY, // @param Number(= undefined): shadowOffsetY
                      blur) {  // @param Number(= undefined): shadowBlur
                               // @return this:
    var ctx = this._cctx;
    (color   !== void 0) && (ctx.shadowColor   = ctx._shadow[0] = color);
    (offsetX !== void 0) && (ctx.shadowOffsetX = ctx._shadow[1] = offsetX);
    (offsetY !== void 0) && (ctx.shadowOffsetY = ctx._shadow[2] = offsetY);
    (blur    !== void 0) && (ctx.shadowBlur    = ctx._shadow[3] = blur);
    return this;
  },

  // uuCanvas.Layer.setText - set text style
  //    font: CSS font style value. (eg: "10px sans-serif")
  //    textAlign: "start", "end", "left", "right", "center"
  //    textBaseline: "top", "hanging", "middle",
  //                  "alphabetic", "ideographic", "bottom"
  setText: function(font,       // @param CSSFontString(= undefined): font
                    align,      // @param Number(= undefined): textAlign
                    baseline) { // @param String(= undefined): textBaseline
                                // @return this:
    var ctx = this._cctx;
    (font     !== void 0) && (ctx.font = font);
    (align    !== void 0) && (ctx.textAlign = align);
    (baseline !== void 0) && (ctx.textBaseline = baseline);
    return this;
  },

  // uuCanvas.Layer.set - set many styles
  set: function(style) { // @param Hash: Hash( { prop: value, ... } )
                         // @return this:
    var ctx = this._cctx, i, v = 0,
        find = { shadowColor: 1, shadowOffsetX: 2,
                 shadowOffsetY: 3, shadowBlur: 4 };
    for (i in style) {
      if ( (v = find[i]) ) {
        ctx._shadow[v - 1] = style[i];
      }
      ctx[i] = style[i];
    }
    return this;
  },

  // uuCanvas.Layer.get - get many styles
  get: function(style) { // @param Hash: Hash( { prop: dummyValue, ... } )
                         // @return Hash: Hash( { globalAlpha: 1.0 } )
    var ctx = this._cctx, i, rv = {}, v = 0,
        find = { shadowColor: 1, shadowOffsetX: 2,
                 shadowOffsetY: 3, shadowBlur: 4 };
    for (i in style) {
      if ( (v = find[i]) ) {
        rv[i] = ctx[i] || ctx._shadow[v - 1];
      } else {
        rv[i] = ctx[i];
      }
    }
    return rv;
  },

  // uuCanvas.Layer.clear - clear rect
  clear: function(x,   // @param Number(= 0): position x
                  y,   // @param Number(= 0): position y
                  w,   // @param Number(= canvas.width):  width
                  h) { // @param Number(= canvas.height): height
                       // @return this:
    var ctx = this._cctx;
    ctx.clearRect(x || 0, y || 0,
                  w || ctx.canvas.width, h || ctx.canvas.height);
    return this;
  },

  // uuCanvas.Layer.save
  save: function() { // @return this:
    this._cctx.save();
    return this;
  },

  // uuCanvas.Layer.restore
  restore: function() { // @return this:
    this._cctx.restore();
    return this;
  },

  // uuCanvas.Layer.scale - scale
  scale: function(w,   // @param Number: width scale
                  h) { // @param Number: height scale
                       // @return this:
    this._cctx.scale(w, h);
    return this;
  },

  // uuCanvas.Layer.translate - offset origin
  translate: function(x,   // @param Number: offset x
                      y) { // @param Number: offset y
                           // @return this:
    this._cctx.translate(x, y);
    return this;
  },

  // uuCanvas.Layer.rotate - rotate
  //    angle: 359 or "359deg" or "1.5rad"
  rotate: function(angle) { // @param Number/String: angle
                            // @return this:
    var ang = (/rad$/.test(angle + "") ? 1 : _toDegrees) * _float(angle);
    this._cctx.rotate(ang);
    return this;
  },

  // uuCanvas.Layer.transform
  transform: function(m11, m12, m21, m22, dx, dy) {
    this._cctx.transform(m11, m12, m21, m22, dx, dy);
    return this;
  },

  // uuCanvas.Layer.setTransform
  setTransform: function(m11, m12, m21, m22, dx, dy) {
    this._cctx.setTransform(m11, m12, m21, m22, dx, dy);
    return this;
  },

  // uuCanvas.Layer.begin - beginPath + moveTo
  begin: function(x,    // @param Number/undefined(= undefined): move x
                  y) {  // @param Number/undefined(= undefined): move y
                        // @return this:
    this._cctx.beginPath();
    (x !== void 0 && y !== void 0) && this._cctx.moveTo(x || 0, y || 0);
    return this;
  },

  // uuCanvas.Layer.move - moveTo
  move: function(x,   // @param Number: move x
                 y) { // @param Number: move y
                      // @return this:
    this._cctx.moveTo(x, y);
    return this;
  },

  // uuCanvas.Layer.line - lineTo
  line: function(x,   // @param Number: move x
                 y) { // @param Number: move y
                      // @return this:
    this._cctx.lineTo(x, y);
    return this;
  },

  // uuCanvas.Layer.arc - arc
  //    a0 and a1: 359 or "359deg" or "0rad"
  arc: function(x,       // @param Number:
                y,       // @param Number:
                r,       // @param Number:
                a0,      // @param Number/String(= "0deg"): angle0
                a1,      // @param Number/String(= "359deg"): angle1
                clock) { // @param Boolean(= true):
                         // @return this:
    a0 = a0 || "0deg";
    a1 = a1 || "359deg";
    var ang0 = (/rad$/.test(a0 + "") ? 1 : _toDegrees) * _float(a0),
        ang1 = (/rad$/.test(a1 + "") ? 1 : _toDegrees) * _float(a1);
    this._cctx.arc(x, y, r, ang0, ang1, (clock === void 0) ? 0 : !clock);
    return this;
  },

  // uuCanvas.Layer.curve - quadraticCurveTo or bezierCurveTo
  curve: function(a0,   // @param Number:
                  a1,   // @param Number:
                  a2,   // @param Number:
                  a3,   // @param Number:
                  a4,   // @param Number(= undefined):
                  a5) { // @param Number(= undefined):
                        // @return this:
    if (a4 === void 0) {
      // cpx, cpy, x, y
      this._cctx.quadraticCurveTo(a0, a1, a2, a3);
    } else {
      // cp1x, cp1y, cp2x, cp2y, x, y
      this._cctx.bezierCurveTo(a0, a1, a2, a3, a4, a5);
    }
    return this;
  },

  // uuCanvas.Layer.clip - clip
  clip: function() { // @return this:
    this._cctx.clip();
    return this;
  },

  // uuCanvas.Layer.stroke - stroke
  stroke: function() { // @return this:
    this._cctx.stroke();
    return this;
  },

  // uuCanvas.Layer.fill - fill or stroke
  fill: function(wire) { // @param Boolean(= false):
                         // @return this:
    wire ? this._cctx.stroke() : this._cctx.fill();
    return this;
  },

  // uuCanvas.Layer.close - closePath
  close: function(x,   // @param Number/undefined(= undefined):
                  y) { // @param Number/undefined(= undefined):
                       // @return this:
    this._cctx.closePath();
    (x !== void 0 && y !== void 0) && this._cctx.moveTo(x || 0, y || 0);
    return this;
  },

  // uuCanvas.Layer.text
  text: function(text,       // @param String:
                 x,          // @param Number(= 0):
                 y,          // @param Number(= 0):
                 wire,       // @param Boolean(= false):
                 maxWidth) { // @param Number/undefined(= undefined):
                             // @return this:
    x = x || 0, y = y || 0;
    if (maxWidth === void 0) {
      wire ? this._cctx.strokeText(text, x, y)
           : this._cctx.fillText(text, x, y);
    } else {
      wire ? this._cctx.strokeText(text, x, y, maxWidth) // Firefox3.1 fuzzy
           : this._cctx.fillText(text, x, y, maxWidth);
    }
    return this;
  },

  // uuCanvas.Layer.getTextSize - get text dimension
  getTextSize: function(text) { // @param String:
                                // @return TextMetrics: { width, height }
    this._cctx.measureText(text);
  },

  // uuCanvas.Layer.poly - poly line + fill
  poly: function(point,  // @param PointArray: Array( [x0, y0, x1, y1, ... ] )
                 wire) { // @param Boolean(= false):
                         // @return this:
    var p = point || [0, 0], i, iz = point.length;
    this.close().begin(p[0], p[1]);
    for (i = 2; i < iz; i += 2) {
      this.line(p[i], p[i + 1]);
    }
    this.fill(wire || false).close();
  },

  // uuCanvas.Layer.box - add box path, fill inside
  box: function(x,      // @param Number:
                y,      // @param Number:
                w,      // @param Number:
                h,      // @param Number:
                r,      // @param Number(= 0):
                wire) { // @param Boolean(= false):
                        // @return this:
    if (!r) {
      wire ? this._cctx.strokeRect(x, y, w, h)
           : this._cctx.fillRect(x, y, w, h);
      return this;
    }
    return this.close().begin(x, y + r).line(x, y + h - r).
                curve(x, y + h, x + r, y + h).line(x + w - r, y + h).
                curve(x + w, y + h, x + w, y + h - r).line(x + w, y + r).
                curve(x + w, y, x + w - r, y).line(x + r, y).
                curve(x, y, x, y + r).fill(wire || false).
                close();
  },

  // uuCanvas.Layer.metabolic - metabolic box
  metabo: function(x,      // @param Number:
                   y,      // @param Number:
                   w,      // @param Number:
                   h,      // @param Number:
                   r,      // @param Number(= 0):
                   tarun,  // @param Number(= 10):
                   wire) { // @param Boolean(= false):
                           // @return this:
    r = r || 0;
    wire = wire || false;
    tarun = (tarun === void 0) ? 10 : tarun;

    if (tarun) {
      return this.close().begin(x, y + r).line(x, y + h - r). // 1
                  curve(x + w * 0.5, y + h + tarun, x + w, y + h - r). // 2,3,4
                  line(x + w, y + r). // 5
                  curve(x + w, y, x + w - r, y).line(x + r, y). // 6,7
                  curve(x, y, x, y + r).fill(wire). // 8
                  close();
    }
    return this.close().begin(x, y + r).line(x, y + h). // 1
                line(x + w, y + h). // 2,3,4
                line(x + w, y + r). // 5
                curve(x + w, y, x + w - r, y).line(x + r, y). // 6,7
                curve(x, y, x, y + r).fill(wire). // 8
                close();
  },

  // uuCanvas.Layer.oval - oval + fill
  oval: function(x,      // @param Number:
                 y,      // @param Number:
                 w,      // @param Number:
                 h,      // @param Number:
                 r,      // @param Number:
                 wire) { // @param Boolean(= false):
                         // @return this:
    wire = wire || false;
    if (w === h) { // circle
      return this.close().begin(x, y).arc(x, y, r).
                  fill(wire).close();
    }
    // ellipse not impl.
    return this;
  },

  // uuCanvas.Layer.dots - draw dot with palette
  //    palette: Hash( { paletteNo: "#ffffff" or { r,g,b,a }, ...} )
  //    data: [paletteNo, paletteNo, ...]
  dots: function(x,       // @param Number:
                 y,       // @param Number:
                 w,       // @param Number:
                 h,       // @param Number:
                 palette, // @param Hash: color palette,
                 data,    // @param Array: dot data
                 index) { // @param Number(= 0): start data index
                          // @return this:
    var ctx = this._cctx, i = 0, j = 0, p, v, idx = index || 0;
    for (; j < h; ++j) {
      for (i = 0; i < w; ++i) {
        v = data[idx + i + j * w];
        if (!(v in palette)) {
          continue;
        }
        p = palette[v];
        if (typeof p === "string") {
          ctx.fillStyle = p;
        } else if (p.a) { // skip alpha = 0
          ctx.fillStyle = "rgba(" + [p.r, p.g, p.b, p.a].join(",") + ")";
        }
        ctx.fillRect(x + i, y + j, 1, 1);
      }
    }
    return this;
  },

  // uuCanvas.Layer.grad - gradation
  //    pos:  [x1, y1, x2, y2] or [x1, y1, r1, x2, y2, r2]
  //    offsetColor: [offset1, color1, offset2, color2, ...]
  //        offset is Number( from 0.0 to 1.0 )
  //        color is HexColorString( "#ffffff" )
  grad: function(pos,           // @param NumberArray:
                 offsetColor) { // @param OffsetColorArray: 
                                // @return this:
    var ctx = this._cctx, rv, i, iz;
    if (pos.length === 4) {
      rv = ctx.createLinearGradient(pos[0], pos[1], pos[2], pos[3]);
    } else {
      rv = ctx.createRadialGradient(pos[0], pos[1], pos[2], pos[3],
                                    pos[4], pos[5]);
    }
    for (i = 0, iz = offsetColor.length; i < iz; i += 2) {
      rv.addColorStop(offsetColor[i], offsetColor[i + 1]);
    }
    return rv;
  },

  // uuCanvas.Layer.pattern - pattern
  pattern: function(image,     // @param HTMLImageElement
                               //        /HTMLCanvasElement:
                    pattern) { // @param String(= "repeat"):
                               // @return this:
    return this._cctx.createPattern(image, (pattern === void 0) ? "repeat"
                                                                : pattern);
  },

  // uuCanvas.Layer.image - image
  image: function(image,  // @param HTMLImageElement
                          //        /HTMLCanvasElement:
                  arg1,   // @param Number(= undefined):
                  arg2,   // @param Number(= undefined):
                  arg3,   // @param Number(= undefined):
                  arg4,   // @param Number(= undefined):
                  arg5,   // @param Number(= undefined):
                  arg6,   // @param Number(= undefined):
                  arg7,   // @param Number(= undefined):
                  arg8) { // @param Number(= undefined):
                          // @return this:
    switch (arguments.length) {
    case 1: this._cctx.drawImage(image, 0, 0); break;
    case 3: this._cctx.drawImage(image, arg1, arg2); break;
    case 5: this._cctx.drawImage(image, arg1, arg2, arg3, arg4); break;
    case 9: this._cctx.drawImage(image, arg1, arg2, arg3, arg4,
                                        arg5, arg6, arg7, arg8); break;
    default: throw "";
    }
    return this;
  },

  // uuCanvas.Layer.fitImage - image fitting(auto-scaling)
  fitImage: function(image) { // @param HTMLImageElement: image element
                              // @return this:
    var w = _int(this._cctx.canvas.width),
        h = _int(this._cctx.canvas.height),
        sw = image.width, sh = image.height,
        dx = (sw <= w) ? _math.floor((w - sw) / 2) : 0,
        dy = (sh <= h) ? _math.floor((h - sh) / 2) : 0,
        dw = (sw <= w) ? sw : w,
        dh = (sh <= h) ? sh : h;
    this._cctx.drawImage(image, 0, 0, sw, sh, dx, dy, dw, dh);
    return this;
  },

  // uuCanvas.Layer.grid - draw hatch
  grid: function(size,     // @param Number(= 10):
                 unit,     // @param Number(= 5):
                 color,    // @param String(= "skyblue"):
                 color2) { // @param String(= "steelblue"):
                           // @return this:
    size = size || 10, unit = unit || 5;
    color = color || "skyblue", color2 = color2 || "steelblue";
    var x = size, y = size, i = 1, j = 1,
        w = _int(this._cctx.canvas.width),
        h = _int(this._cctx.canvas.height);

    for (; x < w; ++i, x += size) {
      this.setStroke((i % unit) ? color : color2).
           begin(x, 0).line(x, h).stroke().close();
    }
    for (; y < h; ++j, y += size) {
      this.setStroke((j % unit) ? color : color2).
           begin(0, y).line(w, y).stroke().close();
    }
    return this;
  },

  // uuCanvas.Layer.angleGlossy
  //    override: Hash ( { gcolor1, gcolor2, overlayAlpha, w, h, r, angle } )
  angleGlossy: function(x,        // @param Number: move x
                        y,        // @param Number: move y
                        preset,   // @param String(= "GBLACK"): preset name
                        extend) { // @param Hash(= undefined): extend style
                                  // @return this:
    preset = (preset || "GBLACK").toUpperCase();
    preset = (preset in this.preset) ? this.preset[preset] : {};
    extend = uu.mix({ w: 100, h: 100, r: 12, angle: 0 }, preset, extend || {});

    var w = extend.w, h = extend.h, r = extend.r, angle = extend.angle,
        oa = extend.overlayAlpha, b = 3, dist = 0; // bevel size

    if (angle < -45) { angle = -45; }
    if (angle >  45) { angle =  45; }

    this.setFill(this.grad([x, y, x, y + h],
                           [0.0, extend.gcolor1, 1.0, extend.gcolor2])).
         begin().box(x, y, w, h, r).close().
         setFill("rgba(255,255,255," + oa + ")");

    switch (angle) {
    case 45:  this.begin(x + b, y + b + r).line(x + b, y + h - b * 2).
                    line(x + w - b * 2, y + b).line(x + b + r, y + b).
                    curve(x, y, x + b, y + b + r).fill().close(); break;
    case -45: this.begin(x - b + w, y + b + r).line(x - b + w, y + h - b * 2).
                    line(x + b * 2, y + b).line(x - b - r + w, y + b).
                    curve(x + w, y, x - b + w, y + b + r).fill().close(); break;
    default:  dist = ((h - b * 2) / 45 * angle) / 2;
              this.begin(x + b, y + b + r).
                    line(x + b, y + (h / 2) - b * 2 + dist).
                    line(x + w - b, y + (h / 2) - b * 2 - dist).
                    line(x + w - b, y + b + r).
                    curve(x + w, y, x + w - r, y + b).line(x + b + r, y + b).
                    curve(x, y, x + b, y + b + r).fill().close();
    }
    return this;
  },

  // uuCanvas.Layer.metaboGlossy
  metaboGlossy: function(x,        // @param Number: move x
                         y,        // @param Number: move y
                         preset,   // @param String(= "GBLACK"): preset name
                         extend) { // @param Hash(= undefined): extend style
                                   // @return this:
    preset = (preset || "GBLACK").toUpperCase();
    preset = (preset in this.preset) ? this.preset[preset] : {};
    extend = uu.mix({ w: 100, h: 50, r: 12, tarun: 6 }, preset, extend || {});

    var w = extend.w, h = extend.h, r = extend.r, tarun = extend.tarun,
        oa = extend.overlayAlpha, r2 = r > 4 ? r - 4 : 0, b = 3; // bevel size

    this.setFill(this.grad([x, y, x, y + h],
                           [0.0, extend.gcolor1, 1.0, extend.gcolor2])).
          begin().box(x, y, w, h, r).close().
          setFill("rgba(255,255,255," + oa + ")").
          begin().metabo(x + b, y + b, w - b * 2, h * 0.5, r2, tarun).close();
    return this;
  },

  // uuCanvas.Layer.jellyBean
  jellyBean: function(x,        // @param Number: move x
                      y,        // @param Number: move y
                      preset,   // @param String(= "GBLACK"): preset name
                      extend) { // @param Hash(= undefined): extend style
                                 // @return this:
    extend = uu.mix({ w: 100, h: 30, r: 16, tarun: 6 }, extend || {});
    this.metaboGlossy(x, y, preset, extend);
    return this;
  }
};
})();
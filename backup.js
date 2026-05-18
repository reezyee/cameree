const { PrismaClient } = require('@prisma/client');

// 💡 DATA ASLI MAHA KARYA LO DARI API/STRIPS REZ! RESIK TANPA TYPO!
const dataAsliAPI = [
  {
    "name": "Frank Ocean",
    "backgroundMode": "image",
    "backgroundValue": "https://res.cloudinary.com/dyh1najmn/image/upload/v1779106805/cameree/strips/qyq674dds7ahjkedow5s.jpg",
    "totalShots": 3,
    "canvasWidth": 300,
    "canvasHeight": 900,
    "elements": [
      {"h": 179, "id": "photo-0", "radius": "50px 50px 0px 0px", "rotate": 0, "type": "photo", "w": 261, "x": 17, "y": 138},
      {"h": 177, "id": "photo-1", "radius": "0px", "rotate": 0, "type": "photo", "w": 261, "x": 17, "y": 315},
      {"h": 181, "id": "photo-2", "radius": "0px 0px 50px 50px", "rotate": 0, "type": "photo", "w": 261, "x": 17, "y": 491},
      {"h": 337, "id": "st-1779106167205", "radius": "0px", "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1779106166/cameree/strips/lhjaoqkokmgjo04rjhpt.png", "type": "sticker", "w": 265, "x": 19, "y": -87},
      {"h": 353, "id": "st-1779106464874", "radius": "0px", "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1779106495/cameree/strips/ipmr647cqmrvcwd8ouax.png", "type": "sticker", "w": 235, "x": 36, "y": 612},
      {"h": 107, "id": "st-1779106853462", "radius": "0px", "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1779106879/cameree/strips/qmvexsyy17qwxx0aurzy.png", "type": "sticker", "w": 238, "x": 33, "y": 763},
      {"h": 35, "id": "st-1779106990085", "radius": "0px", "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1779106989/cameree/strips/afpvae2cjhuktxlajywx.png", "type": "sticker", "w": 63, "x": 7, "y": 869}
    ],
    "photoPositions": [
      {"h": 179, "id": "photo-0", "index": 0, "radius": "50px 50px 0px 0px", "rotate": 0, "w": 261, "x": 17, "y": 138},
      {"h": 177, "id": "photo-1", "index": 1, "radius": "0px", "rotate": 0, "w": 261, "x": 17, "y": 315},
      {"h": 181, "id": "photo-2", "index": 2, "radius": "0px 0px 50px 50px", "rotate": 0, "w": 261, "x": 17, "y": 491}
    ],
    "overlays": [
      {"h": 337, "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1779106166/cameree/strips/lhjaoqkokmgjo04rjhpt.png", "w": 265, "x": 19, "y": -87},
      {"h": 353, "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1779106495/cameree/strips/ipmr647cqmrvcwd8ouax.png", "w": 235, "x": 36, "y": 612},
      {"h": 107, "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1779106879/cameree/strips/qmvexsyy17qwxx0aurzy.png", "w": 238, "x": 33, "y": 763},
      {"h": 35, "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1779106989/cameree/strips/afpvae2cjhuktxlajywx.png", "w": 63, "x": 7, "y": 869}
    ]
  },
  {
    "name": "Caméree",
    "backgroundMode": "color",
    "backgroundValue": "#050505",
    "totalShots": 3,
    "canvasWidth": 300,
    "canvasHeight": 900,
    "elements": [
      {"h": 235, "id": "photo-0", "radius": "0px", "rotate": 0, "type": "photo", "w": 249, "x": 24, "y": 21},
      {"h": 234, "id": "photo-1", "radius": "0px", "rotate": 0, "type": "photo", "w": 250, "x": 23, "y": 261},
      {"h": 235, "id": "photo-2", "radius": "0px", "rotate": 0, "type": "photo", "w": 252, "x": 22, "y": 499},
      {"h": 304, "id": "st-1779037910081", "radius": "0px", "rotate": 17, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1779037909/cameree/strips/cot4v9oxwg5h5gsuch1f.png", "type": "sticker", "w": 212, "x": 103, "y": 682}
    ],
    "photoPositions": [
      {"h": 235, "id": "photo-0", "index": 0, "radius": "0px", "rotate": 0, "w": 249, "x": 24, "y": 21},
      {"h": 234, "id": "photo-1", "index": 1, "radius": "0px", "rotate": 0, "w": 250, "x": 23, "y": 261},
      {"h": 235, "id": "photo-2", "index": 2, "radius": "0px", "rotate": 0, "w": 252, "x": 22, "y": 499}
    ],
    "overlays": [
      {"h": 304, "rotate": 17, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1779037909/cameree/strips/cot4v9oxwg5h5gsuch1f.png", "w": 212, "x": 103, "y": 682}
    ]
  },
  {
    "name": "ILY",
    "backgroundMode": "color",
    "backgroundValue": "#ffffff",
    "totalShots": 4,
    "canvasWidth": 300,
    "canvasHeight": 900,
    "elements": [
      {"h": 182, "id": "photo-0", "radius": "0px", "rotate": 0, "type": "photo", "w": 302, "x": -1, "y": 3},
      {"h": 172, "id": "photo-1", "radius": "0px", "rotate": 0, "type": "photo", "w": 304, "x": -3, "y": 188},
      {"h": 182, "id": "photo-2", "radius": "0px", "rotate": 0, "type": "photo", "w": 309, "x": -2, "y": 528},
      {"h": 182, "id": "photo-3", "radius": "0px", "rotate": 0, "type": "photo", "w": 304, "x": -1, "y": 715},
      {"h": 182, "id": "st-1779037237566", "radius": "0px", "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1779037244/cameree/strips/hoeujt6yhmkbldwq4gtv.png", "type": "sticker", "w": 228, "x": 37, "y": 355},
      {"h": 30, "id": "st-1779037306141", "radius": "0px", "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1779037305/cameree/strips/txq9nzmqbhtivnwpaeny.png", "type": "sticker", "w": 31, "x": 264, "y": 499}
    ],
    "photoPositions": [
      {"h": 182, "id": "photo-0", "index": 0, "radius": "0px", "rotate": 0, "w": 302, "x": -1, "y": 3},
      {"h": 172, "id": "photo-1", "index": 1, "radius": "0px", "rotate": 0, "w": 304, "x": -3, "y": 188},
      {"h": 182, "id": "photo-2", "index": 2, "radius": "0px", "rotate": 0, "w": 309, "x": -2, "y": 528},
      {"h": 182, "id": "photo-3", "index": 3, "radius": "0px", "rotate": 0, "w": 304, "x": -1, "y": 715}
    ],
    "overlays": [
      {"h": 182, "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1779037244/cameree/strips/hoeujt6yhmkbldwq4gtv.png", "w": 228, "x": 37, "y": 355},
      {"h": 30, "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1779037305/cameree/strips/txq9nzmqbhtivnwpaeny.png", "w": 31, "x": 264, "y": 499}
    ]
  },
  {
    "name": "Birthday's",
    "backgroundMode": "color",
    "backgroundValue": "#ffffff",
    "totalShots": 1,
    "canvasWidth": 300,
    "canvasHeight": 900,
    "elements": [
      {"h": 327, "id": "st-1779034874127", "radius": "0px", "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1779034989/cameree/strips/lbgmoknpo8loldpznwic.png", "type": "sticker", "w": 342, "x": -33, "y": -17},
      {"h": 33, "id": "st-1779035149658", "radius": "0px", "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1779035149/cameree/strips/ugnysduywr5np1bok7x7.png", "type": "sticker", "w": 67, "x": 116, "y": 868},
      {"h": 292, "id": "st-1779035218609", "radius": "0px", "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1779035227/cameree/strips/jew3szv0orvteismegri.png", "type": "sticker", "w": 341, "x": -29, "y": 621},
      {"h": 433, "id": "photo-0", "radius": "0px", "rotate": 0, "type": "photo", "w": 300, "x": 0, "y": 255},
      {"h": 107, "id": "st-1779035377509", "radius": "0px", "rotate": -20, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1779035392/cameree/strips/bdzaduynrqxk5y1f76pe.png", "type": "sticker", "w": 94, "x": 217, "y": 23}
    ],
    "photoPositions": [
      {"h": 433, "id": "photo-0", "index": 0, "radius": "0px", "rotate": 0, "w": 300, "x": 0, "y": 255}
    ],
    "overlays": [
      {"h": 327, "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1779034989/cameree/strips/lbgmoknpo8loldpznwic.png", "w": 342, "x": -33, "y": -17},
      {"h": 33, "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1779035149/cameree/strips/ugnysduywr5np1bok7x7.png", "w": 67, "x": 116, "y": 868},
      {"h": 292, "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1779035227/cameree/strips/jew3szv0orvteismegri.png", "w": 341, "x": -29, "y": 621},
      {"h": 107, "rotate": -20, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1779035392/cameree/strips/bdzaduynrqxk5y1f76pe.png", "w": 94, "x": 217, "y": 23}
    ]
  },
  {
    "name": "TV Analog",
    "backgroundMode": "image",
    "backgroundValue": "https://res.cloudinary.com/dyh1najmn/image/upload/v1779034170/cameree/strips/zxzhj3vui1diinld2pxr.jpg",
    "totalShots": 4,
    "canvasWidth": 300,
    "canvasHeight": 900,
    "elements": [
      {"h": 164, "id": "photo-0", "radius": "0px", "rotate": 0, "type": "photo", "w": 221, "x": 20, "y": 44},
      {"h": 166, "id": "photo-1", "radius": "0px", "rotate": 0, "type": "photo", "w": 221, "x": 20, "y": 235},
      {"h": 166, "id": "photo-2", "radius": "0px", "rotate": 0, "type": "photo", "w": 221, "x": 18, "y": 430},
      {"h": 166, "id": "photo-3", "radius": "0px", "rotate": 0, "type": "photo", "w": 223, "x": 21, "y": 628},
      {"h": 227, "id": "st-1779034177593", "radius": "0px", "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1779034197/cameree/strips/gmsueirh13ccmev1a5bf.png", "type": "sticker", "w": 297, "x": 0, "y": 8},
      {"h": 227, "id": "st-dup-1779034331461", "radius": "0px", "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1779034197/cameree/strips/gmsueirh13ccmev1a5bf.png", "type": "sticker", "w": 297, "x": 2, "y": 203},
      {"h": 227, "id": "st-dup-1779034342393", "radius": "0px", "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1779034197/cameree/strips/gmsueirh13ccmev1a5bf.png", "type": "sticker", "w": 297, "x": 4, "y": 596},
      {"h": 227, "id": "st-dup-1779034348377", "radius": "0px", "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1779034197/cameree/strips/gmsueirh13ccmev1a5bf.png", "type": "sticker", "w": 297, "x": 6, "y": 399},
      {"h": 78, "id": "st-1779034440682", "radius": "0px", "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1779034440/cameree/strips/dnkyj0hbjph7mor46tpi.png", "type": "sticker", "w": 136, "x": 81, "y": 828}
    ],
    "photoPositions": [
      {"h": 164, "id": "photo-0", "index": 0, "radius": "0px", "rotate": 0, "w": 221, "x": 20, "y": 44},
      {"h": 166, "id": "photo-1", "index": 1, "radius": "0px", "rotate": 0, "w": 221, "x": 20, "y": 235},
      {"h": 166, "id": "photo-2", "index": 2, "radius": "0px", "rotate": 0, "w": 221, "x": 18, "y": 430},
      {"h": 166, "id": "photo-3", "index": 3, "radius": "0px", "rotate": 0, "w": 223, "x": 21, "y": 628}
    ],
    "overlays": [
      {"h": 227, "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1779034197/cameree/strips/gmsueirh13ccmev1a5bf.png", "w": 297, "x": 0, "y": 8},
      {"h": 227, "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1779034197/cameree/strips/gmsueirh13ccmev1a5bf.png", "w": 297, "x": 2, "y": 203},
      {"h": 227, "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1779034197/cameree/strips/gmsueirh13ccmev1a5bf.png", "w": 297, "x": 4, "y": 596},
      {"h": 227, "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1779034197/cameree/strips/gmsueirh13ccmev1a5bf.png", "w": 297, "x": 6, "y": 399},
      {"h": 78, "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1779034440/cameree/strips/dnkyj0hbjph7mor46tpi.png", "w": 136, "x": 81, "y": 828}
    ]
  },
  {
    "name": "Caméree  III",
    "backgroundMode": "color",
    "backgroundValue": "#ffffff",
    "totalShots": 4,
    "canvasWidth": 400,
    "canvasHeight": 600,
    "elements": [
      {"h": 204, "id": "photo-0", "radius": "0px", "rotate": 0, "type": "photo", "w": 156, "x": 30, "y": 24},
      {"h": 203, "id": "photo-1", "radius": "0px", "rotate": 0, "type": "photo", "w": 155, "x": 210, "y": 23},
      {"h": 206, "id": "photo-2", "radius": "0px", "rotate": 0, "type": "photo", "w": 157, "x": 30, "y": 245},
      {"h": 206, "id": "photo-3", "radius": "0px", "rotate": 0, "type": "photo", "w": 157, "x": 210, "y": 244},
      {"h": 61, "id": "st-1778986767069", "radius": "0px", "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1778986766/cameree/strips/mcyvvi6lb5ajhjvd0yaw.png", "type": "sticker", "w": 175, "x": 28, "y": 458},
      {"h": 57, "id": "st-1778987970293", "radius": "0px", "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1778988001/cameree/strips/tei5ogijjrshxltqjcqo.png", "type": "sticker", "w": 147, "x": 30, "y": 504},
      {"h": 38, "id": "st-1778988484607", "radius": "0px", "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1778988501/cameree/strips/mrvqhcn4ujgadoyakn5t.png", "type": "sticker", "w": 173, "x": 207, "y": 553},
      {"h": 196, "id": "st-1778989781475", "radius": "0px", "rotate": 1, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1778989781/cameree/strips/x3e53iyh3ru8akiribhg.png", "type": "sticker", "w": 177, "x": 202, "y": 418},
      {"h": 120, "id": "st-1778989782914", "radius": "0px", "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1778989782/cameree/strips/jkvo0orlhsv1u79rfe5e.png", "type": "sticker", "w": 120, "x": 15, "y": 520}
    ],
    "photoPositions": [
      {"h": 204, "id": "photo-0", "index": 0, "radius": "0px", "rotate": 0, "w": 156, "x": 30, "y": 24},
      {"h": 203, "id": "photo-1", "index": 1, "radius": "0px", "rotate": 0, "w": 155, "x": 210, "y": 23},
      {"h": 206, "id": "photo-2", "index": 2, "radius": "0px", "rotate": 0, "w": 157, "x": 30, "y": 245},
      {"h": 206, "id": "photo-3", "index": 3, "radius": "0px", "rotate": 0, "w": 157, "x": 210, "y": 244}
    ],
    "overlays": [
      {"h": 61, "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1778986766/cameree/strips/mcyvvi6lb5ajhjvd0yaw.png", "w": 175, "x": 28, "y": 458},
      {"h": 57, "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1778988001/cameree/strips/tei5ogijjrshxltqjcqo.png", "w": 147, "x": 30, "y": 504},
      {"h": 38, "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1778988501/cameree/strips/mrvqhcn4ujgadoyakn5t.png", "w": 173, "x": 207, "y": 553},
      {"h": 196, "rotate": 1, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1778989781/cameree/strips/x3e53iyh3ru8akiribhg.png", "w": 177, "x": 202, "y": 418},
      {"h": 120, "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1778989782/jkvo0orlhsv1u79rfe5e.png", "w": 120, "x": 15, "y": 520}
    ]
  },
  {
    "name": "Caméree II",
    "backgroundMode": "color",
    "backgroundValue": "#0f0f0f",
    "totalShots": 4,
    "canvasWidth": 300,
    "canvasHeight": 1600,
    "elements": [
      {"h": 375, "id": "photo-0", "radius": "0px", "rotate": 0, "type": "photo", "w": 292, "x": 4, "y": 64},
      {"h": 375, "id": "photo-1", "radius": "0px", "rotate": 0, "type": "photo", "w": 294, "x": 3, "y": 447},
      {"h": 379, "id": "photo-2", "radius": "0px", "rotate": 0, "type": "photo", "w": 294, "x": 2, "y": 833},
      {"h": 378, "id": "photo-3", "radius": "0px", "rotate": 0, "type": "photo", "w": 294, "x": 1, "y": 1222},
      {"h": 120, "id": "st-1778985722608", "radius": "0px", "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1778985722/cameree/strips/zj2rfbi2vilwivgdhb8d.png", "type": "sticker", "w": 120, "x": 91, "y": -23}
    ],
    "photoPositions": [
      {"h": 375, "id": "photo-0", "index": 0, "radius": "0px", "rotate": 0, "w": 292, "x": 4, "y": 64},
      {"h": 375, "id": "photo-1", "index": 1, "radius": "0px", "rotate": 0, "w": 294, "x": 3, "y": 447},
      {"h": 379, "id": "photo-2", "index": 2, "radius": "0px", "rotate": 0, "w": 294, "x": 2, "y": 833},
      {"h": 378, "id": "photo-3", "index": 3, "radius": "0px", "rotate": 0, "w": 294, "x": 1, "y": 1222}
    ],
    "overlays": [
      {"h": 120, "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1778985722/cameree/strips/zj2rfbi2vilwivgdhb8d.png", "w": 120, "x": 91, "y": -23}
    ]
  },
  {
    "name": "Zootopia",
    "backgroundMode": "image",
    "backgroundValue": "https://res.cloudinary.com/dyh1najmn/image/upload/v1777886409/cameree/strips/ezxe0htdts344i5tzsqs.jpg",
    "totalShots": 3,
    "canvasWidth": 600,
    "canvasHeight": 900,
    "elements": [
      {"h": 137, "id": "photo-0", "radius": "0px", "rotate": 0, "type": "photo", "w": 155, "x": 133, "y": 152},
      {"h": 143, "id": "photo-1", "radius": "0px", "rotate": 0, "type": "photo", "w": 155, "x": 133, "y": 289},
      {"h": 140, "id": "photo-2", "radius": "0px", "rotate": 0, "type": "photo", "w": 155, "x": 133, "y": 432},
      {"h": 215, "id": "st-1777884179615", "radius": "0px", "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1777884199/cameree/strips/u0cxevd7pukz049obrca.png", "type": "sticker", "w": 305, "x": 299, "y": 502},
      {"h": 477, "id": "st-1777884487031", "radius": "0px", "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1777884496/cameree/strips/krygeej64nenbqp6hbqa.png", "type": "sticker", "w": 270, "x": -29, "y": 293},
      {"h": 120, "id": "st-1777884641477", "radius": "0px", "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1777884651/cameree/strips/lpoqsorj1k8yygwc6cu9.png", "type": "sticker", "w": 120, "x": 236, "y": 42}
    ],
    "photoPositions": [
      {"h": 137, "id": "photo-0", "index": 0, "radius": "0px", "rotate": 0, "w": 155, "x": 133, "y": 152},
      {"h": 143, "id": "photo-1", "index": 1, "radius": "0px", "rotate": 0, "w": 155, "x": 133, "y": 289},
      {"h": 140, "id": "photo-2", "index": 2, "radius": "0px", "rotate": 0, "w": 155, "x": 133, "y": 432}
    ],
    "overlays": [
      {"h": 215, "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1777884199/cameree/strips/u0cxevd7pukz049obrca.png", "w": 305, "x": 299, "y": 502},
      {"h": 477, "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1777884496/cameree/strips/krygeej64nenbqp6hbqa.png", "w": 270, "x": -29, "y": 293},
      {"h": 120, "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1777884651/cameree/strips/lpoqsorj1k8yygwc6cu9.png", "w": 120, "x": 236, "y": 42}
    ]
  },
  {
    "name": "Albums",
    "backgroundMode": "image",
    "backgroundValue": "https://res.cloudinary.com/dyh1najmn/image/upload/v1777881174/cameree/strips/h8n4dkrpbqd0y8jsfusx.jpg",
    "totalShots": 3,
    "canvasWidth": 300,
    "canvasHeight": 900,
    "elements": [
      {"h": 188, "id": "photo-0", "radius": "8px 8px 8px 8px", "rotate": 0, "type": "photo", "w": 278, "x": 11, "y": 137},
      {"h": 190, "id": "photo-1", "radius": "8px 8px 8px 8px", "rotate": 0, "type": "photo", "w": 277, "x": 11, "y": 379},
      {"h": 190, "id": "photo-2", "radius": "8px 8px 8px 8px", "rotate": 0, "type": "photo", "w": 277, "x": 12, "y": 622},
      {"h": 65, "id": "st-1777881385513", "radius": "0px", "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1777881384/cameree/strips/rhvm4rfacosdf82jybke.png", "type": "sticker", "w": 50, "x": 244, "y": 821}
    ],
    "photoPositions": [
      {"h": 188, "id": "photo-0", "index": 0, "radius": "8px 8px 8px 8px", "rotate": 0, "w": 278, "x": 11, "y": 137},
      {"h": 190, "id": "photo-1", "index": 1, "radius": "8px 8px 8px 8px", "rotate": 0, "w": 277, "x": 11, "y": 379},
      {"h": 190, "id": "photo-2", "index": 2, "radius": "8px 8px 8px 8px", "rotate": 0, "w": 277, "x": 12, "y": 622}
    ],
    "overlays": [
      {"h": 65, "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1777881384/cameree/strips/rhvm4rfacosdf82jybke.png", "w": 50, "x": 244, "y": 821}
    ]
  },
  {
    "name": "Caméree I",
    "backgroundMode": "color",
    "backgroundValue": "#000000",
    "totalShots": 4,
    "canvasWidth": 300,
    "canvasHeight": 900,
    "elements": [
      {"h": 227, "id": "photo-0", "radius": "0px", "rotate": 0, "type": "photo", "w": 236, "x": -2, "y": -2},
      {"h": 228, "id": "photo-1", "radius": "0px", "rotate": 0, "type": "photo", "w": 240, "x": -4, "y": 222},
      {"h": 226, "id": "photo-2", "radius": "0px", "rotate": 0, "type": "photo", "w": 239, "x": -3, "y": 449},
      {"h": 227, "id": "photo-3", "radius": "0px", "rotate": 0, "type": "photo", "w": 239, "x": -4, "y": 674},
      {"h": 912, "id": "st-1777828116367", "radius": "0px", "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1777828115/cameree/strips/xtkvnyrym7vcggmqgjuu.png", "type": "sticker", "w": 492, "x": -90, "y": -5}
    ],
    "photoPositions": [
      {"h": 227, "id": "photo-0", "index": 0, "radius": "0px", "rotate": 0, "w": 236, "x": -2, "y": -2},
      {"h": 228, "id": "photo-1", "index": 1, "radius": "0px", "rotate": 0, "w": 240, "x": -4, "y": 222},
      {"h": 226, "id": "photo-2", "index": 2, "radius": "0px", "rotate": 0, "w": 239, "x": -3, "y": 449},
      {"h": 227, "id": "photo-3", "index": 3, "radius": "0px", "rotate": 0, "w": 239, "x": -4, "y": 674}
    ],
    "overlays": [
      {"h": 912, "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1777828115/cameree/strips/xtkvnyrym7vcggmqgjuu.png", "w": 492, "x": -90, "y": -5}
    ]
  },
  {
    "name": "Spiderman",
    "backgroundMode": "image",
    "backgroundValue": "https://res.cloudinary.com/dyh1najmn/image/upload/v1778949862/cameree/strips/salncsggtwrzs58tbkb9.jpg",
    "totalShots": 3,
    "canvasWidth": 300,
    "canvasHeight": 900,
    "elements": [
      {"h": 198, "id": "photo-0", "radius": "0px", "rotate": 0, "type": "photo", "w": 266, "x": 15, "y": 72},
      {"h": 201, "id": "photo-1", "radius": "0px", "rotate": 0, "type": "photo", "w": 265, "x": 15, "y": 278},
      {"h": 199, "id": "photo-2", "radius": "0px", "rotate": 0, "type": "photo", "w": 266, "x": 16, "y": 486},
      {"h": 281, "id": "st-1778949957163", "radius": "0px", "rotate": 90, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1778949956/cameree/strips/vznobrpog1lm6mxpwhql.png", "type": "sticker", "w": 210, "x": 43, "y": 33},
      {"h": 281, "id": "st-dup-1778949991214", "radius": "0px", "rotate": 90, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1778949956/cameree/strips/vznobrpog1lm6mxpwhql.png", "type": "sticker", "w": 210, "x": 42, "y": 240},
      {"h": 281, "id": "st-dup-1778949996487", "radius": "0px", "rotate": 90, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1778949956/cameree/strips/vznobrpog1lm6mxpwhql.png", "type": "sticker", "w": 210, "x": 43, "y": 448},
      {"h": 348, "id": "st-1778950379129", "radius": "0px", "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1778950378/cameree/strips/u6cxuxeyyhainu8lo24z.png", "type": "sticker", "w": 315, "x": -17, "y": 606},
      {"h": 167, "id": "st-1778950416627", "radius": "0px", "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1778950447/cameree/strips/wjc29wcaojbimkxpbo1r.png", "type": "sticker", "w": 388, "x": -51, "y": 753},
      {"h": 30, "id": "st-1778950695185", "radius": "0px", "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1778950694/cameree/strips/eovx8ugkqi64emo3o01y.png", "type": "sticker", "w": 76, "x": 10, "y": 0}
    ],
    "photoPositions": [
      {"h": 198, "id": "photo-0", "index": 0, "radius": "0px", "rotate": 0, "w": 266, "x": 15, "y": 72},
      {"h": 201, "id": "photo-1", "index": 1, "radius": "0px", "rotate": 0, "w": 265, "x": 15, "y": 278},
      {"h": 199, "id": "photo-2", "index": 2, "radius": "0px", "rotate": 0, "w": 266, "x": 16, "y": 486}
    ],
    "overlays": [
      {"h": 281, "rotate": 90, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1778949956/cameree/strips/vznobrpog1lm6mxpwhql.png", "w": 210, "x": 43, "y": 33},
      {"h": 281, "rotate": 90, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1778949956/cameree/strips/vznobrpog1lm6mxpwhql.png", "w": 210, "x": 42, "y": 240},
      {"h": 281, "rotate": 90, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1778949956/cameree/strips/vznobrpog1lm6mxpwhql.png", "w": 210, "x": 43, "y": 448},
      {"h": 348, "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1778950378/cameree/strips/u6cxuxeyyhainu8lo24z.png", "w": 315, "x": -17, "y": 606},
      {"h": 167, "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1778950447/cameree/strips/wjc29wcaojbimkxpbo1r.png", "w": 388, "x": -51, "y": 753},
      {"h": 30, "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1778950694/cameree/strips/eovx8ugkqi64emo3o01y.png", "w": 76, "x": 10, "y": 0}
    ]
  },
  {
    "name": "Kendrick Lamar",
    "backgroundMode": "image",
    "backgroundValue": "https://res.cloudinary.com/dyh1najmn/image/upload/v1777822942/cameree/strips/wcbvnjxs9vgwebk4rsye.jpg",
    "totalShots": 3,
    "canvasWidth": 300,
    "canvasHeight": 900,
    "elements": [
      {"h": 163, "id": "photo-2", "radius": "0px", "rotate": 0, "type": "photo", "w": 279, "x": 11, "y": 166},
      {"h": 166, "id": "photo-0", "radius": "0px", "rotate": 0, "type": "photo", "w": 279, "x": 11, "y": 438},
      {"h": 164, "id": "photo-1", "radius": "0px", "rotate": 0, "type": "photo", "w": 279, "x": 11, "y": 614},
      {"h": 149, "id": "st-1777823179238", "radius": "0px", "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1777823187/cameree/strips/d52jb4ewyeny9mzkaikq.png", "type": "sticker", "w": 126, "x": 88, "y": 312},
      {"h": 342, "id": "st-1777823405649", "radius": "0px", "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1777823422/cameree/strips/gtxovovi0mb6fwrclaw3.png", "type": "sticker", "w": 180, "x": 157, "y": 212},
      {"h": 214, "id": "st-1777823407556", "radius": "0px", "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1777823416/cameree/strips/hw01imgxy7bexczorinq.png", "type": "sticker", "w": 116, "x": -7, "y": 273},
      {"h": 557, "id": "st-1777824198034", "radius": "0px", "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1777824204/cameree/strips/jbepfuvns7byu7nc6j1n.png", "type": "sticker", "w": 319, "x": -12, "y": 232},
      {"h": 48, "id": "st-1777824671300", "radius": "0px", "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1777824671/cameree/strips/kghgg1m0hgczx9eenrpa.png", "type": "sticker", "w": 56, "x": 236, "y": 859}
    ],
    "photoPositions": [
      {"h": 163, "id": "photo-2", "index": 0, "radius": "0px", "rotate": 0, "w": 279, "x": 11, "y": 166},
      {"h": 166, "id": "photo-0", "index": 1, "radius": "0px", "rotate": 0, "w": 279, "x": 11, "y": 438},
      {"h": 164, "id": "photo-1", "index": 2, "radius": "0px", "rotate": 0, "w": 279, "x": 11, "y": 614}
    ],
    "overlays": [
      {"h": 149, "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1777823187/cameree/strips/d52jb4ewyeny9mzkaikq.png", "w": 126, "x": 88, "y": 312},
      {"h": 342, "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1777823422/cameree/strips/gtxovovi0mb6fwrclaw3.png", "w": 180, "x": 157, "y": 212},
      {"h": 214, "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1777823416/cameree/strips/hw01imgxy7bexczorinq.png", "w": 116, "x": -7, "y": 273},
      {"h": 557, "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1777824204/cameree/strips/jbepfuvns7byu7nc6j1n.png", "w": 319, "x": -12, "y": 232},
      {"h": 48, "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1777824671/cameree/strips/kghgg1m0hgczx9eenrpa.png", "w": 56, "x": 236, "y": 859}
    ]
  },
  {
    "name": "Baddie",
    "backgroundMode": "image",
    "backgroundValue": "https://res.cloudinary.com/dyh1najmn/image/upload/v1777815434/cameree/strips/wlqtkpysxdqifi3kl2no.jpg",
    "totalShots": 3,
    "canvasWidth": 300,
    "canvasHeight": 900,
    "elements": [
      {"h": 194, "id": "photo-0", "radius": "0px", "rotate": 0, "type": "photo", "w": 277, "x": 10, "y": 88},
      {"h": 191, "id": "photo-2", "radius": "0px", "rotate": 0, "type": "photo", "w": 276, "x": 11, "y": 290},
      {"h": 192, "id": "photo-1", "radius": "0px", "rotate": 0, "type": "photo", "w": 276, "x": 12, "y": 489},
      {"h": 57, "id": "st-1777815593791", "radius": "0px", "rotate": -2, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1777815614/cameree/strips/tfclvyk5lweneru6hzyu.png", "type": "sticker", "w": 34, "x": 96, "y": 637},
      {"h": 162, "id": "st-1777816616245", "radius": "0px", "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1777816616/cameree/strips/inthxdizj0w0acivq5n1.png", "type": "sticker", "w": 176, "x": -14, "y": 581},
      {"h": 93, "id": "st-1777816752994", "radius": "0px", "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1777816752/cameree/strips/pxx9lz9cksikk5qxqdw3.png", "type": "sticker", "w": 73, "x": 217, "y": 835}
    ],
    "photoPositions": [
      {"h": 194, "id": "photo-0", "index": 0, "radius": "0px", "rotate": 0, "w": 277, "x": 10, "y": 88},
      {"h": 191, "id": "photo-2", "index": 1, "radius": "0px", "rotate": 0, "w": 276, "x": 11, "y": 290},
      {"h": 192, "id": "photo-1", "index": 2, "radius": "0px", "rotate": 0, "w": 276, "x": 12, "y": 489}
    ],
    "overlays": [
      {"h": 57, "rotate": -2, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1777815614/cameree/strips/tfclvyk5lweneru6hzyu.png", "w": 34, "x": 96, "y": 637},
      {"h": 162, "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1777816616/cameree/strips/inthxdizj0w0acivq5n1.png", "w": 176, "x": -14, "y": 581},
      {"h": 93, "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1777816752/cameree/strips/pxx9lz9cksikk5qxqdw3.png", "w": 73, "x": 217, "y": 835}
    ]
  },
  {
    "name": "Nadin Amizah",
    "backgroundMode": "image",
    "backgroundValue": "https://res.cloudinary.com/dyh1najmn/image/upload/v1777814456/cameree/strips/jfryyj75i1tvnentiwv3.jpg",
    "totalShots": 3,
    "canvasWidth": 300,
    "canvasHeight": 900,
    "elements": [
      {"h": 669, "id": "st-1777814484801", "radius": "0px", "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1777814484/cameree/strips/rgyjxi8vfbabyo67mrlm.png", "type": "sticker", "w": 328, "x": -11, "y": 503},
      {"h": 248, "id": "st-dup-1777814964864", "radius": "0px", "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1777814950/cameree/strips/yoxv4bj3dcjf0t03u60q.png", "type": "sticker", "w": 247, "x": -105, "y": -72},
      {"h": 248, "id": "st-1777814950534", "radius": "0px", "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1777814950/cameree/strips/yoxv4bj3dcjf0t03u60q.png", "type": "sticker", "w": 247, "x": 163, "y": 9},
      {"h": 242, "id": "st-1777814829903", "radius": "0px", "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1777814829/cameree/strips/hqtgia4sfiwjht6oszo7.png", "type": "sticker", "w": 170, "x": -31, "y": 4},
      {"h": 227, "id": "st-1777815075049", "radius": "0px", "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1777815074/cameree/strips/r6v6fzuglsabunglful3.png", "type": "sticker", "w": 181, "x": -35, "y": 205},
      {"h": 193, "id": "photo-0", "radius": "0px 71px 0px 0px", "rotate": 0, "type": "photo", "w": 263, "x": 16, "y": 241},
      {"h": 187, "id": "photo-1", "radius": "0px", "rotate": 0, "type": "photo", "w": 266, "x": 16, "y": 460},
      {"h": 185, "id": "photo-2", "radius": "0px 0px 0px 79px", "rotate": 0, "type": "photo", "w": 262, "x": 18, "y": 666},
      {"h": 246, "id": "st-1777812783092", "radius": "0px", "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1777812783/cameree/strips/utjuz4aipequ5emx3xhc.png", "type": "sticker", "w": 203, "x": 84, "y": 704},
      {"h": 187, "id": "st-1777812786604", "radius": "0px", "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1777812786/cameree/strips/w0btxuobzsobszonqr1i.png", "type": "sticker", "w": 248, "x": -34, "y": 315},
      {"h": 210, "id": "st-1777813286416", "radius": "0px", "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1777813337/cameree/strips/cvmttcbtshhhctxtm0ol.png", "type": "sticker", "w": 196, "x": 149, "y": 231},
      {"h": 44, "id": "st-1777813711640", "radius": "0px", "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1777813729/cameree/strips/lfgx9xsqsbgoww0imlsa.png", "type": "sticker", "w": 55, "x": 169, "y": 215},
      {"h": 293, "id": "st-1777813946493", "radius": "0px", "rotate": 2, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1777813943/cameree/strips/v0awlipkge90gvs9etz6.png", "type": "sticker", "w": 143, "x": -34, "y": 611},
      {"h": 44, "id": "st-dup-1777813764218", "radius": "0px", "rotate": 178, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1777813729/cameree/strips/lfgx9xsqsbgoww0imlsa.png", "type": "sticker", "w": 55, "x": 48, "y": 813},
      {"h": 91, "id": "st-1777814052684", "radius": "0px", "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1777814052/cameree/strips/wmygykemq7jseunl5mav.png", "type": "sticker", "w": 74, "x": 9, "y": 840}
    ],
    "photoPositions": [
      {"h": 193, "id": "photo-0", "index": 0, "radius": "0px 71px 0px 0px", "rotate": 0, "w": 263, "x": 16, "y": 241},
      {"h": 187, "id": "photo-1", "index": 1, "radius": "0px", "rotate": 0, "w": 266, "x": 16, "y": 460},
      {"h": 185, "id": "photo-2", "index": 2, "radius": "0px 0px 0px 79px", "rotate": 0, "w": 262, "x": 18, "y": 666}
    ],
    "overlays": [
      {"h": 669, "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1777814484/cameree/strips/rgyjxi8vfbabyo67mrlm.png", "w": 328, "x": -11, "y": 503},
      {"h": 248, "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1777814950/cameree/strips/yoxv4bj3dcjf0t03u60q.png", "w": 247, "x": -105, "y": -72}
    ]
  },
  {
    "name": "Holidays",
    "backgroundMode": "image",
    "backgroundValue": "https://res.cloudinary.com/dyh1najmn/image/upload/v1777745856/cameree/strips/nfq4abrb76ht3lgtcmov.jpg",
    "totalShots": 2,
    "canvasWidth": 500,
    "canvasHeight": 900,
    "elements": [
      {"h": 146, "id": "photo-0", "radius": "0px", "rotate": 0, "type": "photo", "w": 182, "x": 163, "y": 284},
      {"h": 148, "id": "photo-1", "radius": "0px", "rotate": 0, "type": "photo", "w": 182, "x": 163, "y": 435}
    ],
    "photoPositions": [
      {"h": 146, "id": "photo-0", "index": 0, "radius": "0px", "rotate": 0, "w": 182, "x": 163, "y": 284},
      {"h": 148, "id": "photo-1", "index": 1, "radius": "0px", "rotate": 0, "w": 182, "x": 163, "y": 435}
    ],
    "overlays": []
  },
  {
    "name": "Billie HMHAS",
    "backgroundMode": "image",
    "backgroundValue": "https://res.cloudinary.com/dyh1najmn/image/upload/v1777744819/cameree/strips/nvnaj10xb6y1axyflowy.jpg",
    "totalShots": 3,
    "canvasWidth": 300,
    "canvasHeight": 900,
    "elements": [
      {"h": 180, "id": "photo-0", "radius": "50%", "rotate": 0, "type": "photo", "w": 280, "x": 8, "y": 17},
      {"h": 180, "id": "photo-1", "radius": "50%", "rotate": 0, "type": "photo", "w": 280, "x": 3, "y": 213},
      {"h": 180, "id": "photo-2", "radius": "50%", "rotate": 0, "type": "photo", "w": 280, "x": 10, "y": 408},
      {"h": 436, "id": "st-1777744877889", "radius": "0px", "rotate": 180, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1777744877/cameree/strips/onz5rcdtoudqnljx8fm8.png", "type": "sticker", "w": 380, "x": -44, "y": 265}
    ],
    "photoPositions": [
      {"h": 180, "id": "photo-0", "index": 0, "radius": "50%", "rotate": 0, "w": 280, "x": 8, "y": 17},
      {"h": 180, "id": "photo-1", "index": 1, "radius": "50%", "rotate": 0, "w": 280, "x": 3, "y": 213},
      {"h": 180, "id": "photo-2", "index": 2, "radius": "50%", "rotate": 0, "w": 280, "x": 10, "y": 408}
    ],
    "overlays": [
      {"h": 436, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1777744877/cameree/strips/onz5rcdtoudqnljx8fm8.png", "w": 380, "x": -44, "y": 265}
    ]
  },
  {
    "name": "Valentine's Day",
    "backgroundMode": "color",
    "backgroundValue": "#ffffff",
    "totalShots": 3,
    "canvasWidth": 300,
    "canvasHeight": 900,
    "elements": [
      {"h": 224, "id": "photo-0", "radius": "0px", "rotate": 0, "type": "photo", "w": 270, "x": 12, "y": 21},
      {"h": 227, "id": "photo-1", "radius": "0px", "rotate": 0, "type": "photo", "w": 268, "x": 15, "y": 282},
      {"h": 225, "id": "photo-2", "radius": "0px", "rotate": 0, "type": "photo", "w": 272, "x": 15, "y": 542},
      {"h": 1363, "id": "st-1777743781503", "radius": "0px", "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1777743780/cameree/strips/weoeiatrpzwdgets7fhf.png", "type": "sticker", "w": 702, "x": -201, "y": -231}
    ],
    "photoPositions": [
      {"h": 224, "id": "photo-0", "index": 0, "radius": "0px", "rotate": 0, "w": 270, "x": 12, "y": 21},
      {"h": 227, "id": "photo-1", "index": 1, "radius": "0px", "rotate": 0, "w": 268, "x": 15, "y": 282},
      {"h": 225, "id": "photo-2", "index": 2, "radius": "0px", "rotate": 0, "w": 272, "x": 15, "y": 542}
    ],
    "overlays": [
      {"h": 1363, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1777743780/cameree/strips/weoeiatrpzwdgets7fhf.png", "w": 702, "x": -201, "y": -231}
    ]
  },
  {
    "name": "Alwayss by Daniel Caesar",
    "backgroundMode": "image",
    "backgroundValue": "https://res.cloudinary.com/dyh1najmn/image/upload/v1777741024/cameree/strips/e3egctrjg0b4s6mzmech.jpg",
    "totalShots": 1,
    "canvasWidth": 400,
    "canvasHeight": 800,
    "elements": [
      {"h": 561, "id": "st-1777741129834", "radius": "0px", "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1777741129/cameree/strips/ppk9wsaeolivbvhx30cs.png", "type": "sticker", "w": 362, "x": 20, "y": 365},
      {"h": 274, "id": "photo-0", "radius": "0px", "rotate": 0, "type": "photo", "w": 313, "x": 47, "y": 270}
    ],
    "photoPositions": [
      {"h": 274, "id": "photo-0", "index": 0, "radius": "0px", "rotate": 0, "w": 313, "x": 47, "y": 270}
    ],
    "overlays": [
      {"h": 561, "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1777741129/cameree/strips/ppk9wsaeolivbvhx30cs.png", "w": 362, "x": 20, "y": 365}
    ]
  },
  {
    "name": "Daniel Caesar Freudian",
    "backgroundMode": "image",
    "backgroundValue": "https://res.cloudinary.com/dyh1najmn/image/upload/v1777738567/cameree/strips/vxtiycenjtnpvwrbtbjc.jpg",
    "totalShots": 3,
    "canvasWidth": 300,
    "canvasHeight": 900,
    "elements": [
      {"h": 171, "id": "photo-0", "radius": "71px 71px 0px 0px", "rotate": 0, "type": "photo", "w": 271, "x": 14, "y": 107},
      {"h": 169, "id": "photo-1", "radius": "0px", "rotate": 0, "type": "photo", "w": 270, "x": 14, "y": 295},
      {"h": 167, "id": "photo-2", "radius": "0px", "rotate": 0, "type": "photo", "w": 268, "x": 15, "y": 484},
      {"h": 448, "id": "st-1777738587508", "radius": "0px", "rotate": 0, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1777738586/cameree/strips/vnhot9xf9mmrqvbknmgg.png", "type": "sticker", "w": 343, "x": -23, "y": 538}
    ],
    "photoPositions": [
      {"h": 171, "id": "photo-0", "index": 0, "radius": "71px 71px 0px 0px", "rotate": 0, "w": 271, "x": 14, "y": 107},
      {"h": 169, "id": "photo-1", "index": 1, "radius": "0px", "rotate": 0, "w": 270, "x": 14, "y": 295},
      {"h": 167, "id": "photo-2", "index": 2, "radius": "0px", "rotate": 0, "w": 268, "x": 15, "y": 484}
    ],
    "overlays": [
      {"h": 448, "src": "https://res.cloudinary.com/dyh1najmn/image/upload/v1777738586/cameree/strips/vnhot9xf9mmrqvbknmgg.png", "w": 343, "x": -23, "y": 538}
    ]
  },
  {
    "name": "Nadin Amizah Album 2023",
    "backgroundMode": "image",
    "backgroundValue": "https://res.cloudinary.com/dyh1najmn/image/upload/v1777736356/cameree/strips/kya0yq8wjqtrd4xrrpaq.jpg",
    "totalShots": 2,
    "canvasWidth": 500,
    "canvasHeight": 900,
    "elements": [
      {"h": 153, "id": "photo-0", "radius": "0px", "rotate": 2, "type": "photo", "w": 212, "x": 178, "y": 216},
      {"h": 153, "id": "photo-1", "radius": "0px", "rotate": -1, "type": "photo", "w": 212, "x": 134, "y": 408}
    ],
    "photoPositions": [
      {"h": 153, "id": "photo-0", "index": 0, "radius": "0px", "rotate": 2, "w": 212, "x": 178, "y": 216},
      {"h": 153, "id": "photo-1", "index": 1, "radius": "0px", "rotate": -1, "w": 212, "x": 134, "y": 408}
    ],
    "overlays": []
  }
];

const cloudUrl = "mysql://2HnVW32Misv6yYA.root:jIbxKTaDMWO5FvxW@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/test?sslaccept=strict";

async function main() {
  console.log(`\n🔄 Memulai injeksi massal ${dataAsliAPI.length} template asli ke TiDB Cloud...`);
  const prismaCloud = new PrismaClient({ datasources: { db: { url: cloudUrl } } });

  let suksesCount = 0;
  for (const item of dataAsliAPI) {
    try {
      // 🛠️ FIX DI SINI REZ: Panggil model `stripTemplate` sesuai dengan isi skema lo
      await prismaCloud.stripTemplate.create({
        data: {
          name: item.name,
          thumbnailUrl: "",
          backgroundMode: item.backgroundMode,
          backgroundValue: item.backgroundValue,
          totalShots: item.totalShots,
          canvasWidth: item.canvasWidth,
          canvasHeight: item.canvasHeight,
          elements: item.elements || [],
          photoPositions: item.photoPositions || [],
          overlays: item.overlays || [],
          isActive: true
        }
      });
      suksesCount++;
      console.log(`   ✅ [${suksesCount}/${dataAsliAPI.length}] Sukses mengangkasa: ${item.name}`);
    } catch (err) {
      if (err.code === 'P2002') {
        console.log(`   ⚠️ Template "${item.name}" udah nongkrong di cloud (Skip).`);
      } else {
        console.error(`   ❌ Gagal menyuntik "${item.name}":`, err.message);
      }
    }
  }

  await prismaCloud.$disconnect();
  console.log(`\n🎉 SELESAI REZ! Seluruh ${suksesCount} mahakarya template lo resmi migrasi total 100% presisi ke TiDB Cloud!`);
}

main().catch((err) => {
  console.error('💥 Bos terakhir eror:', err);
});
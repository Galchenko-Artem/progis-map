# 🗺️ PROGIS Map — React + Leaflet + WMS/WFS (строгая типизация)

Одностраничное приложение на **React + TypeScript** с **Leaflet**, которое:

- подключает **WMS слой**;
- по клику делает **GetFeatureInfo (GFI)** и показывает свойства объекта во всплывающем **popup**;
- если GFI пустой — выполняет **WFS GetFeature (bbox)** и показывает атрибуты + подсвечивает геометрию;
- код полностью типизирован (**без any**);
- состояние управляется через **Zustand**.

---

## 🌍 Используемый демо-сервер

По умолчанию используется стабильный публичный **GeoServer**:

👉 [https://ahocevar.com/geoserver](https://ahocevar.com/geoserver)

---

## ⚙️ Технологический стек

- **React 19**
- **TypeScript 5**
- **Vite 7**
- **Leaflet 1.9**, **react-leaflet 5**
- **Zustand** — глобальное состояние
- **Axios** — WFS-запросы
- **ESLint (strict)** — строгие правила

---

## ✨ Возможности

- Подключение WMS-слоя `topp:states` (полигоны штатов США)
- Клик по карте → **GetFeatureInfo** → всплывающее окно с атрибутами
- Подсветка выбранного объекта (**GeoJSON-слой**)
- Fallback на **WFS** (BBOX + `count=1`)
- Переключение видимости слоёв (панель «Слои»)

---

## 📁 Структура проекта

src/
├── app/
│ └── store.ts # Zustand: visible / highlight / popup
├── components/
│ ├── AttributePopup.tsx # popup со свойствами
│ ├── LayerToggle.tsx # переключатель слоёв
│ └── MapView.tsx # карта, GFI/WFS логика, подсветка
├── config/
│ └── env.ts # OGC эндпоинты
├── layers.ts # описание WMS/WFS слоёв
├── services/
│ ├── wfs.ts # WFS GetFeature
│ └── wms.ts # конструктор URL для GetFeatureInfo
├── types/
│ └── geojson.ts # типы GeoJSON-совместимые
├── App.tsx
├── main.tsx
└── styles.css

---

## 🚀 Быстрый старт

```bash
# 1. Установка зависимостей
npm install

# 2. Запуск в dev-режиме
npm run dev

# 3. Сборка production-версии
npm run build

# 4. Предпросмотр сборки
npm run preview


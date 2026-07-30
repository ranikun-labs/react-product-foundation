import {
  APP_ROUTE_PATHS,
  buildAppHomePath,
  buildAppItemDetailPath,
  buildAppItemsPath,
  buildAppSettingsPath,
  buildPublicFeaturesPath,
  buildPublicHomePath,
  isSupportedLocale,
} from '@/constants/routes';

describe('route contract', () => {
  it('builds the fixed public and app paths', () => {
    expect(buildPublicHomePath('ko')).toBe('/ko');
    expect(buildPublicFeaturesPath('en')).toBe('/en/features');
    expect(buildAppHomePath()).toBe('/app');
    expect(buildAppItemsPath()).toBe('/app/items');
    expect(buildAppSettingsPath()).toBe('/app/settings');
    expect(APP_ROUTE_PATHS.itemDetail).toBe('/app/items/:id');
  });

  it('encodes an item identifier exactly once', () => {
    expect(buildAppItemDetailPath('folder/item 1')).toBe('/app/items/folder%2Fitem%201');
  });

  it('accepts only supported locales', () => {
    expect(isSupportedLocale('ko')).toBe(true);
    expect(isSupportedLocale('en')).toBe(true);
    expect(isSupportedLocale('fr')).toBe(false);
  });
});

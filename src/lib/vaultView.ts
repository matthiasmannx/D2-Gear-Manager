/** Vault-filterinstellingen, lokaal bewaard + via SettingsSync per account gesynct. */
export interface VaultView {
  typeFilter?: string;
  rarity?: string;
  mwOnly?: boolean;
  lockedOnly?: boolean;
  favOnly?: boolean;
  tierFilter?: string;
  powerSort?: string;
}

export const VAULT_KEY = "gh_vault_view";
export const VAULT_EVT = "gh-vaultview-changed";

export function readVaultView(): VaultView {
  try {
    return JSON.parse(localStorage.getItem(VAULT_KEY) || "{}");
  } catch {
    return {};
  }
}

export function writeVaultView(v: VaultView) {
  localStorage.setItem(VAULT_KEY, JSON.stringify(v));
  window.dispatchEvent(new Event(VAULT_EVT));
}

import { STORAGE_KEYS, getStorageItem, setStorageItem } from "./config.js";
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function signup(fullName, username, email, password){
    const users = getStorageItem(STORAGE_KEYS.USERS, []);
    if (users.find(u => u.email === email)) {
        throw new Error('Email already exists');
    }
    if (users.find(u => u.username === username)) {
        throw new Error('Username already taken');
    }
    const hashedPassword = await hashPassword(password);
    const newUser = { id: Date.now(), fullName, username, email, passwordHash: hashedPassword };
    users.push(newUser);
    setStorageItem(STORAGE_KEYS.USERS, users);
    setStorageItem(STORAGE_KEYS.SESSION_USER, { id: newUser.id, fullName: newUser.fullName, username: newUser.username, email: newUser.email });
    return newUser;
}

export async function login(username, password) {
  const users = getStorageItem(STORAGE_KEYS.USERS, []);
  const user = users.find(u => u.username === username);
  if (!user) throw new Error('Invalid username or password');
  const hashedInput = await hashPassword(password);
  if (user.passwordHash !== hashedInput) throw new Error('Invalid username or password');
  setStorageItem(STORAGE_KEYS.SESSION_USER, { id: user.id, fullName: user.fullName, username: user.username, email: user.email });
  return user;
}

export function logout() {
  setStorageItem(STORAGE_KEYS.SESSION_USER, null);
}

export function getLoggedInUser() {
  return getStorageItem(STORAGE_KEYS.SESSION_USER, null);
}

export function getUserName() {
  const user = getLoggedInUser();
  return user ? user.username : '';
}

export function getUserFullName() {
  const user = getLoggedInUser();
  return user ? user.fullName : '';
}

export function isAuthenticated() {
    return getLoggedInUser() !== null;
}
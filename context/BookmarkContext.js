import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getToken } from '../utils/api';

const STORAGE_PREFIX = '@bookmarks_';
const GUEST_KEY = `${STORAGE_PREFIX}guest`;
function decodeBase64(str) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let output = '';
  let buffer = 0;
  let bits = 0;
  for (let i = 0; i < str.length; i++) {
    const val = chars.indexOf(str[i]);
    if (val === -1 || str[i] === '=') continue;
    buffer = (buffer << 6) | val;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      output += String.fromCharCode((buffer >> bits) & 0xff);
    }
  }
  return output;
}

function getUserIdFromToken(token) {
  try {
    const payloadPart = token.split('.')[1];
    const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeBase64(base64);
    const payload = JSON.parse(json);
    return payload?.id || null;
  } catch (err) {
    return null;
  }
}

async function resolveStorageKey() {
  const token = await getToken();
  if (!token) return GUEST_KEY;
  const userId = getUserIdFromToken(token);
  return userId ? `${STORAGE_PREFIX}${userId}` : GUEST_KEY;
}

const BookmarkContext = createContext(null);

export function BookmarkProvider({ children }) {
  const [bookmarks, setBookmarks] = useState({});
  const [loaded, setLoaded] = useState(false);
  const isFirstLoad = useRef(true);
  const currentKeyRef = useRef(null);

  const loadForKey = useCallback(async (key) => {
    try {
      const raw = await AsyncStorage.getItem(key);
      setBookmarks(raw ? JSON.parse(raw) : {});
    } catch (err) {
      console.log('Could not load bookmarks:', err?.message || err);
      setBookmarks({});
    }
  }, []);

  const refreshForUser = useCallback(async () => {
    const key = await resolveStorageKey();
    if (key === currentKeyRef.current) return;

    isFirstLoad.current = true;
    currentKeyRef.current = key;
    await loadForKey(key);
    isFirstLoad.current = false;
  }, [loadForKey]);

  useEffect(() => {
    (async () => {
      const key = await resolveStorageKey();
      currentKeyRef.current = key;
      await loadForKey(key);
      isFirstLoad.current = false;
      setLoaded(true);
    })();
  }, [loadForKey]);

  useEffect(() => {
    if (isFirstLoad.current || !currentKeyRef.current) return;
    AsyncStorage.setItem(currentKeyRef.current, JSON.stringify(bookmarks)).catch((err) => {
      console.log('Could not save bookmarks:', err?.message || err);
    });
  }, [bookmarks]);

  const toggleBookmark = useCallback((item) => {
    if (!item?._id) return;
    setBookmarks((prev) => {
      const next = { ...prev };
      if (next[item._id]) {
        delete next[item._id];
      } else {
        next[item._id] = item;
      }
      return next;
    });
  }, []);

  const isBookmarked = useCallback(
    (id) => !!bookmarks[id],
    [bookmarks]
  );

  const bookmarkedList = useMemo(() => Object.values(bookmarks), [bookmarks]);

  const value = useMemo(
    () => ({ bookmarks, bookmarkedList, toggleBookmark, isBookmarked, loaded, refreshForUser }),
    [bookmarks, bookmarkedList, toggleBookmark, isBookmarked, loaded, refreshForUser]
  );

  return (
    <BookmarkContext.Provider value={value}>
      {children}
    </BookmarkContext.Provider>
  );
}

export function useBookmarks() {
  const ctx = useContext(BookmarkContext);
  if (!ctx) {
    throw new Error('useBookmarks() must be used within a bookmark provider');
  }
  return ctx;
}
const NOTIFICATION_EVENT = 'moveTogetherNotificationsChanged';

const getNotificationStorageKey = (profileId) => `moveTogetherNotifications:${profileId || 'anonymous'}`;

const getStoredNotificationState = (profileId) => {
  if (typeof window === 'undefined') {
    return { readIds: [], deletedIds: [] };
  }

  try {
    const storedValue = window.localStorage.getItem(getNotificationStorageKey(profileId));
    const parsedValue = storedValue ? JSON.parse(storedValue) : {};

    return {
      readIds: Array.isArray(parsedValue.readIds) ? parsedValue.readIds.map(String) : [],
      deletedIds: Array.isArray(parsedValue.deletedIds) ? parsedValue.deletedIds.map(String) : [],
    };
  } catch {
    return { readIds: [], deletedIds: [] };
  }
};

const setStoredNotificationState = (profileId, nextState) => {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(
    getNotificationStorageKey(profileId),
    JSON.stringify({
      readIds: [...new Set((nextState.readIds || []).map(String))],
      deletedIds: [...new Set((nextState.deletedIds || []).map(String))],
    })
  );
  window.dispatchEvent(new Event(NOTIFICATION_EVENT));
};

export const getNotificationState = getStoredNotificationState;

export const getVisibleNotifications = (notifications, profileId) => {
  const { deletedIds } = getStoredNotificationState(profileId);
  const deletedIdSet = new Set(deletedIds);

  return (notifications || []).filter((notification) => !deletedIdSet.has(String(notification.id)));
};

export const getUnreadNotificationCount = (notifications, profileId) => {
  const { readIds, deletedIds } = getStoredNotificationState(profileId);
  const readIdSet = new Set(readIds);
  const deletedIdSet = new Set(deletedIds);

  return (notifications || []).filter((notification) => {
    const notificationId = String(notification.id);
    return !readIdSet.has(notificationId) && !deletedIdSet.has(notificationId);
  }).length;
};

export const markNotificationAsRead = (profileId, notificationId) => {
  const state = getStoredNotificationState(profileId);

  setStoredNotificationState(profileId, {
    ...state,
    readIds: [...state.readIds, String(notificationId)],
  });
};

export const markNotificationsAsRead = (profileId, notifications) => {
  const state = getStoredNotificationState(profileId);

  setStoredNotificationState(profileId, {
    ...state,
    readIds: [
      ...state.readIds,
      ...(notifications || []).map((notification) => String(notification.id)),
    ],
  });
};

export const deleteNotification = (profileId, notificationId) => {
  const state = getStoredNotificationState(profileId);

  setStoredNotificationState(profileId, {
    readIds: state.readIds,
    deletedIds: [...state.deletedIds, String(notificationId)],
  });
};

export const NOTIFICATION_STATE_CHANGE_EVENT = NOTIFICATION_EVENT;

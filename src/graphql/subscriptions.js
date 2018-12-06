// eslint-disable
// this is an auto generated file. This will be overwritten

export const subJoinGroup = `subscription SubJoinGroup($groupName: String!) {
  subJoinGroup(groupName: $groupName) {
    userID
    groupName
    group {
      name
      readPrivate
      writePrivate
      users {
        id
        username
        firstName
        lastName
        picKey
        accepted
        writable
      }
      chats {
        id
        name
        subject
        groupName
      }
      events {
        id
        name
        time
        mins
        priority
        groupName
        classID
      }
      courseID
    }
    user {
      id
      username
      firstName
      lastName
      picKey
      accepted
      writable
    }
  }
}
`;
export const subLeaveGroup = `subscription SubLeaveGroup($groupName: String!) {
  subLeaveGroup(groupName: $groupName) {
    userID
    groupName
    group {
      name
      readPrivate
      writePrivate
      users {
        id
        username
        firstName
        lastName
        picKey
        accepted
        writable
      }
      chats {
        id
        name
        subject
        groupName
      }
      events {
        id
        name
        time
        mins
        priority
        groupName
        classID
      }
      courseID
    }
    user {
      id
      username
      firstName
      lastName
      picKey
      accepted
      writable
    }
  }
}
`;
export const subInviteToGroup = `subscription SubInviteToGroup($groupName: String!) {
  subInviteToGroup(groupName: $groupName) {
    userID
    groupName
    group {
      name
      readPrivate
      writePrivate
      users {
        id
        username
        firstName
        lastName
        picKey
        accepted
        writable
      }
      chats {
        id
        name
        subject
        groupName
      }
      events {
        id
        name
        time
        mins
        priority
        groupName
        classID
      }
      courseID
    }
    user {
      id
      username
      firstName
      lastName
      picKey
      accepted
      writable
    }
  }
}
`;
export const subUserInviteToGroup = `subscription SubUserInviteToGroup($userID: String!) {
  subUserInviteToGroup(userID: $userID) {
    userID
    groupName
    group {
      name
      readPrivate
      writePrivate
      users {
        id
        username
        firstName
        lastName
        picKey
        accepted
        writable
      }
      chats {
        id
        name
        subject
        groupName
      }
      events {
        id
        name
        time
        mins
        priority
        groupName
        classID
      }
      courseID
    }
    user {
      id
      username
      firstName
      lastName
      picKey
      accepted
      writable
    }
  }
}
`;
export const subCreateChat = `subscription SubCreateChat($groupName: String!) {
  subCreateChat(groupName: $groupName) {
    id
    name
    subject
    groupName
  }
}
`;
export const subCreateMessage = `subscription SubCreateMessage($chatID: String!) {
  subCreateMessage(chatID: $chatID) {
    chatID
    message {
      id
      text
      objKey
      creationEpochSecs
      chatID
      senderID
    }
    sender {
      id
      username
      firstName
      lastName
      picKey
      accepted
      writable
    }
  }
}
`;
export const subEventsUpdated = `subscription SubEventsUpdated($groupName: String!) {
  subEventsUpdated(groupName: $groupName) {
    events {
      id
      name
      time
      mins
      priority
      groupName
      classID
    }
    groupName
  }
}
`;
export const subEventsDeleted = `subscription SubEventsDeleted($groupName: String!) {
  subEventsDeleted(groupName: $groupName) {
    events {
      id
      name
      time
      mins
      priority
      groupName
      classID
    }
    groupName
  }
}
`;

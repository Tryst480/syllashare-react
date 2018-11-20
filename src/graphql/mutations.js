// eslint-disable
// this is an auto generated file. This will be overwritten

export const createGroup = `mutation CreateGroup(
  $groupName: String!
  $readPrivate: Boolean!
  $writePrivate: Boolean!
) {
  createGroup(
    groupName: $groupName
    readPrivate: $readPrivate
    writePrivate: $writePrivate
  ) {
    name
    readPrivate
    writePrivate
  }
}
`;
export const joinGroup = `mutation JoinGroup($groupName: String!) {
  joinGroup(groupName: $groupName) {
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
export const leaveGroup = `mutation LeaveGroup($groupName: String!, $kickUserID: String) {
  leaveGroup(groupName: $groupName, kickUserID: $kickUserID) {
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
export const inviteToGroup = `mutation InviteToGroup(
  $groupName: String!
  $inviteToUserID: String!
  $write: Boolean!
) {
  inviteToGroup(
    groupName: $groupName
    inviteToUserID: $inviteToUserID
    write: $write
  ) {
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
export const createChat = `mutation CreateChat(
  $groupName: String!
  $chatName: String!
  $chatSubject: String
) {
  createChat(
    groupName: $groupName
    chatName: $chatName
    chatSubject: $chatSubject
  ) {
    id
    name
    subject
    groupName
  }
}
`;
export const createMessage = `mutation CreateMessage(
  $chatID: String!
  $text: String
  $objKey: String
  $creationEpochSecs: Int
) {
  createMessage(
    chatID: $chatID
    text: $text
    objKey: $objKey
    creationEpochSecs: $creationEpochSecs
  ) {
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
export const setWritable = `mutation SetWritable(
  $groupName: String!
  $setUserID: String!
  $writable: Boolean!
) {
  setWritable(
    groupName: $groupName
    setUserID: $setUserID
    writable: $writable
  ) {
    userID
    writable
  }
}
`;

// eslint-disable
// this is an auto generated file. This will be overwritten

export const subJoinGroup = `subscription SubJoinGroup($groupName: String!) {
  subJoinGroup(groupName: $groupName) {
    userID
    groupName
    group {
      name
      private
      users {
        id
        username
        firstName
        lastName
        picKey
        accepted
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
      private
      users {
        id
        username
        firstName
        lastName
        picKey
        accepted
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
      private
      users {
        id
        username
        firstName
        lastName
        picKey
        accepted
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
      private
      users {
        id
        username
        firstName
        lastName
        picKey
        accepted
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
    }
  }
}
`;

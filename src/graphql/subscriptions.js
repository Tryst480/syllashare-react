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
    id
    text
    objKey
    creationEpochSecs
    chatID
  }
}
`;

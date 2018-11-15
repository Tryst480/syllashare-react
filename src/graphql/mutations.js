// eslint-disable
// this is an auto generated file. This will be overwritten

export const createGroup = `mutation CreateGroup($groupName: String!, $groupPrivate: Boolean!) {
  createGroup(groupName: $groupName, groupPrivate: $groupPrivate) {
    name
    private
  }
}
`;
export const joinGroup = `mutation JoinGroup($groupName: String!) {
  joinGroup(groupName: $groupName) {
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
export const leaveGroup = `mutation LeaveGroup($groupName: String!) {
  leaveGroup(groupName: $groupName) {
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
export const inviteToGroup = `mutation InviteToGroup($groupName: String!, $inviteToUserID: String!) {
  inviteToGroup(groupName: $groupName, inviteToUserID: $inviteToUserID) {
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
    id
    text
    objKey
    creationEpochSecs
  }
}
`;

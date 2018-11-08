// eslint-disable
// this is an auto generated file. This will be overwritten

export const subJoinGroup = `subscription SubJoinGroup($groupName: String!) {
  subJoinGroup(groupName: $groupName) {
    groupName
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
    groupName
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
    groupName
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
export const subUserInviteToGroup = `subscription SubUserInviteToGroup($inviteToUserID: String!) {
  subUserInviteToGroup(inviteToUserID: $inviteToUserID) {
    groupName
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
  }
}
`;
export const subCreateMessage = `subscription SubCreateMessage($chatID: String!) {
  subCreateMessage(chatID: $chatID) {
    id
    text
    objKey
    creationEpochSecs
  }
}
`;

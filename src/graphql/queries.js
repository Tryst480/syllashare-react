// eslint-disable
// this is an auto generated file. This will be overwritten

export const getGroups = `query GetGroups {
  getGroups {
    accepted
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
  }
}
`;
export const getGroup = `query GetGroup($groupName: String!) {
  getGroup(groupName: $groupName) {
    accepted
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
  }
}
`;
export const getMessages = `query GetMessages($chatID: String!) {
  getMessages(chatID: $chatID) {
    messages {
      id
      text
      objKey
      creationEpochSecs
      chatID
      senderID
    }
    senders {
      id
      username
      firstName
      lastName
      picKey
      school {
        name
        city
        state
        picKey
      }
      accepted
    }
  }
}
`;

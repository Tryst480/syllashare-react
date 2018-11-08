// eslint-disable
// this is an auto generated file. This will be overwritten

export const getGroups = `query GetGroups {
  getGroups {
    name
    private
    users {
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
    }
    chats {
      id
      name
      subject
    }
  }
}
`;
export const getGroup = `query GetGroup($groupName: String!) {
  getGroup(groupName: $groupName) {
    name
    private
    users {
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
    }
    chats {
      id
      name
      subject
    }
  }
}
`;
export const getMessages = `query GetMessages($chatID: String!) {
  getMessages(chatID: $chatID) {
    id
    text
    objKey
    creationEpochSecs
  }
}
`;

// eslint-disable
// this is an auto generated file. This will be overwritten

export const getGroups = `query GetGroups {
  getGroups {
    accepted
    writable
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
  }
}
`;
export const getGroup = `query GetGroup($groupName: String!) {
  getGroup(groupName: $groupName) {
    accepted
    writable
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
      writable
    }
  }
}
`;
export const searchGroups = `query SearchGroups($query: String!) {
  searchGroups(query: $query) {
    name
    readPrivate
    writePrivate
  }
}
`;

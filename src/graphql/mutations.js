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
      events {
        id
        name
        time
        mins
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
      events {
        id
        name
        time
        mins
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
      events {
        id
        name
        time
        mins
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
export const createClass = `mutation CreateClass(
  $courseID: String!
  $schoolName: String!
  $term: String!
  $year: Int!
  $courseName: String
  $teacherName: String
  $timeStr: String
) {
  createClass(
    courseID: $courseID
    schoolName: $schoolName
    term: $term
    year: $year
    courseName: $courseName
    teacherName: $teacherName
    timeStr: $timeStr
  ) {
    id
    course {
      id
      name
    }
    teacher {
      name
    }
    term
    year
    timeStr
  }
}
`;
export const updateEvents = `mutation UpdateEvents($groupName: String!, $events: [EventInput]) {
  updateEvents(groupName: $groupName, events: $events) {
    events {
      id
      name
      time
      mins
      groupName
    }
    groupName
  }
}
`;
export const deleteEvents = `mutation DeleteEvents($groupName: String!, $eventIDs: [String]) {
  deleteEvents(groupName: $groupName, eventIDs: $eventIDs) {
    events {
      id
      name
      time
      mins
      groupName
    }
    groupName
  }
}
`;

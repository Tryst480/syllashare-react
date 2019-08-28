/* eslint-disable */
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
        school {
          name
          city
          state
          picKey
        }
        accepted
        writable
        providers
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
      school {
        name
        city
        state
        picKey
      }
      accepted
      writable
      providers
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
        school {
          name
          city
          state
          picKey
        }
        accepted
        writable
        providers
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
      school {
        name
        city
        state
        picKey
      }
      accepted
      writable
      providers
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
        school {
          name
          city
          state
          picKey
        }
        accepted
        writable
        providers
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
      school {
        name
        city
        state
        picKey
      }
      accepted
      writable
      providers
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
      school {
        name
        city
        state
        picKey
      }
      accepted
      writable
      providers
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
  $writePrivate: Boolean
) {
  createClass(
    courseID: $courseID
    schoolName: $schoolName
    term: $term
    year: $year
    courseName: $courseName
    teacherName: $teacherName
    timeStr: $timeStr
    writePrivate: $writePrivate
  ) {
    id
    course {
      id
      name
      school {
        name
        city
        state
        picKey
      }
    }
    teacher {
      name
      school {
        name
        city
        state
        picKey
      }
    }
    term
    year
    timeStr
    group {
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
          school {
            name
            city
            state
            picKey
          }
          accepted
          writable
          providers
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
    }
  }
}
`;
export const updateEvents = `mutation UpdateEvents(
  $groupName: String
  $events: [EventInput]
  $personal: Boolean
) {
  updateEvents(groupName: $groupName, events: $events, personal: $personal) {
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
export const deleteEvents = `mutation DeleteEvents(
  $groupName: String
  $eventIDs: [String]
  $personal: Boolean
) {
  deleteEvents(
    groupName: $groupName
    eventIDs: $eventIDs
    personal: $personal
  ) {
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
export const modifyUser = `mutation ModifyUser(
  $username: String
  $firstName: String
  $lastName: String
  $school: String
) {
  modifyUser(
    username: $username
    firstName: $firstName
    lastName: $lastName
    school: $school
  )
}
`;
export const exchangeGoogleCode = `mutation ExchangeGoogleCode($code: String) {
  exchangeGoogleCode(code: $code) {
    idToken
    accessToken
  }
}
`;
export const exchangeToken = `mutation ExchangeToken {
  exchangeToken {
    token
    userID
    expEpochMillis
  }
}
`;
export const updateProfilePic = `mutation UpdateProfilePic($img: String) {
  updateProfilePic(img: $img) {
    picKey
  }
}
`;

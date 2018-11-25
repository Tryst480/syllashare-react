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
      events {
        id
        name
        time
        mins
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
      events {
        id
        name
        time
        mins
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
export const searchCourses = `query SearchCourses($query: String!) {
  searchCourses(query: $query) {
    id
    name
    school {
      name
      city
      state
      picKey
    }
  }
}
`;
export const getClasses = `query GetClasses($courseID: String!) {
  getClasses(courseID: $courseID) {
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
export const getClass = `query GetClass($classID: String!) {
  getClass(classID: $classID) {
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
export const getUserClasses = `query GetUserClasses($userID: String!) {
  getUserClasses(userID: $userID) {
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
export const getUserEvents = `query GetUserEvents($userID: String!) {
  getUserEvents(userID: $userID) {
    id
    name
    time
    mins
    groupName
  }
}
`;
export const searchTeachers = `query SearchTeachers($query: String!) {
  searchTeachers(query: $query) {
    name
    school {
      name
      city
      state
      picKey
    }
  }
}
`;

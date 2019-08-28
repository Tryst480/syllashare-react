/* eslint-disable */
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
      providers
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
export const getClass = `query GetClass($classID: String!) {
  getClass(classID: $classID) {
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
export const getUserClasses = `query GetUserClasses($userID: String!) {
  getUserClasses(userID: $userID) {
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
export const getUserEvents = `query GetUserEvents($userID: String!) {
  getUserEvents(userID: $userID) {
    id
    name
    time
    mins
    priority
    groupName
    classID
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
export const getTerm = `query GetTerm($schoolName: String!, $year: String!, $term: String!) {
  getTerm(schoolName: $schoolName, year: $year, term: $term) {
    start
    end
  }
}
`;
export const getSchools = `query GetSchools {
  getSchools {
    name
    city
    state
    picKey
  }
}
`;
export const getUser = `query GetUser($userID: String) {
  getUser(userID: $userID) {
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
`;
export const searchUsers = `query SearchUsers($query: String) {
  searchUsers(query: $query) {
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
`;

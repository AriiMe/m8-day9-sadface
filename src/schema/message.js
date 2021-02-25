export default `
  type Message {
    id: Int!
    text: String!
    profile: Profile!
    room: Room!
    created_at: String!
  }
  type Subscription {
    newRoomMessage(roomlId: Int!): Message!
  }
  type Query {
    messages(roomId: Int!): [Message!]!
  }
  type Mutation {
    createMessage(roomlId: Int!, text: String!): Boolean!
  }
`;
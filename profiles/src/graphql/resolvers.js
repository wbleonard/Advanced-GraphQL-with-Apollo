import { ApolloError, UserInputError } from "apollo-server";

import { DateTimeType } from "../../../shared/src/index.js";

const resolvers = {
  DateTime: DateTimeType,

  Account: {
    profile(account, args, { dataSources }) {
      return dataSources.profilesAPI.getProfile({
        accountId: account.id
      });
    }
  },

  Profile: {
    __resolveReference(reference, { dataSources, user }) {
      if (user?.sub) {
        return dataSources.profilesAPI.getProfileById(reference.id);
      }
      throw new ApolloError("Not authorized!");
    },
    account(profile) {
      return { id: profile.accountId };
    },
    network(profile, args, { dataSources }) {
      return dataSources.profilesAPI.getNetworkProfiles(profile.network);
    },
    id(profile) {
      return profile._id;
    },
    isInNetwork(profile, args, { dataSources, user }) {
      return dataSources.profilesAPI.checkViewerHasInNetwork(
        user.sub,
        profile.accountId
      );
    }
  },


  Query: {
    async profile(root, { username }, { dataSources }) {
      const profile = await dataSources.profilesAPI.getProfile({ username });

      if (!profile) {
        throw new UserInputError("Profile not available.");
      }
      return profile;
    },
    profiles(root, args, { dataSources }) {
      return dataSources.profilesAPI.getProfiles();
    },
    searchProfiles(root, { query }, { dataSources }) {
      return dataSources.profilesAPI.searchProfiles(query);
    }
  },

  Mutation: {
    createProfile(root, { input }, { dataSources }) {
      return dataSources.profilesAPI.createProfile(input);
    },
    updateProfile(root, { input: { accountId, ...rest } }, { dataSources }) {
      return dataSources.profilesAPI.updateProfile(accountId, rest);
    },
    deleteProfile(root, { accountId }, { dataSources }) {
      return dataSources.profilesAPI.deleteProfile(accountId);
    },
    addToNetwork(
      root,
      { input: { accountId, networkMemberId } },
      { dataSources }
    ) {
      return dataSources.profilesAPI.addToNetwork(accountId, networkMemberId);
    },
    removeFromNetwork(
      root,
      { input: { accountId, networkMemberId } },
      { dataSources }
    ) {
      return dataSources.profilesAPI.removeFromNetwork(
        accountId,
        networkMemberId
      );
    },
  }
};

export default resolvers;
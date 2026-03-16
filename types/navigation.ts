import { NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
  Home:    undefined;
  Posts:   undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Splash:      undefined;
  Auth:        undefined;
  Main:        NavigatorScreenParams<TabParamList>;
  PostDetails: { postId: string };
};
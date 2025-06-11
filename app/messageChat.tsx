import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
  ScrollView
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import { useMessages } from '../components/messages/MessageContext';
import { Entypo, Feather, Octicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import ThemedView from '@/components/ThemedView';
import ThemeText from '@/components/ThemedText';
import { useTheme } from '@/contexts/themeContext';

export default function messageChat() {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params;
  const { getMessagesForConversation, getUser, sendMessage, currentUserId } = useMessages();
  const [newMessage, setNewMessage] = useState('');
  const { dark } = useTheme();
  const [messages, setMessages] = useState(getMessagesForConversation(id));
  const flatListRef = useRef<FlatList<any>>(null);

  const conversationParts = id?.split('-') || [];
  const otherUserId = conversationParts.length > 2 ? conversationParts[2] : '';
  const otherUser = getUser(otherUserId);

  useEffect(() => {
    setMessages(getMessagesForConversation(id));
  }, [id, getMessagesForConversation]);

  const handleSendMessage = () => {
    if (newMessage.trim() && otherUserId) {
      sendMessage(otherUserId, newMessage.trim());
      setNewMessage('');

      setTimeout(() => {
        setMessages(getMessagesForConversation(id));
        flatListRef.current?.scrollToEnd();
      }, 100);
    }
  };

  const formatMessageDate = (date: Date) => {
    return format(date, 'MMM d, h:mm a');
  };

  if (!otherUser) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemeText style={styles.loadingText}>Loading conversation...</ThemeText>
      </ThemedView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container,{backgroundColor:dark ? 'black':'white'}]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ThemedView style={[styles.header,{borderBottomColor: dark ? '#212121' : '#eaeaea',}]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Entypo name='chevron-small-left' size={24} color={dark ?"white" :'#000'} />
          </TouchableOpacity>
          <ThemedView style={styles.userInfo}>
            <Image
              source={{ uri: otherUser.profile_img }}
              style={styles.userImage}
            />
            <ThemedView style={styles.userDetails}>
              <ThemeText style={styles.userName}>{otherUser.username}</ThemeText>
              {otherUser.online && (
                <ThemeText style={styles.onlineStatus}>Online</ThemeText>
              )}
            </ThemedView>
          </ThemedView>
          <ThemedView style={styles.headerActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Feather name='phone-forwarded' size={20} color={dark ?"white" :'#000'} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Octicons name='device-camera-video' size={20} color={dark ?"white" :'#000'} />
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>

        <ScrollView>
          <ThemedView style={styles.profileCard}>
            <Image
              source={{ uri: otherUser.profile_img }}
              style={styles.profileImage}
            />
            <ThemeText style={styles.profileName}>{otherUser.username}</ThemeText>
            <View style={styles.profileStats}>
              <View style={styles.stat}>
                <ThemeText style={styles.statIcon}>👥</ThemeText>
                <ThemeText style={styles.statValue}>
                  {otherUser.followers?.toLocaleString()} Followers
                </ThemeText>
              </View>
              <View style={styles.stat}>
                <ThemeText style={styles.statIcon}>📝</ThemeText>
                <ThemeText style={styles.statValue}>
                  {otherUser.posts} Posts
                </ThemeText>
              </View>
            </View>
            <TouchableOpacity style={styles.viewProfileButton}>
              <ThemeText style={styles.viewProfileText}>View Profile</ThemeText>
            </TouchableOpacity>
          </ThemedView>

          <FlatList
            ref={flatListRef}
            data={messages}
            style={styles.messagesContainer}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
            renderItem={({ item: message, index }) => {
              const isCurrentUser = message.senderId === currentUserId;
              const showAvatar = !isCurrentUser &&
                (index === 0 || messages[index - 1].senderId !== message.senderId);

              return (
                <ThemedView
                  style={[
                    styles.messageBubble,
                    isCurrentUser ? styles.sentBubble : styles.receivedBubble
                  ]}
                >
                  {showAvatar && (
                    <Image
                      source={{ uri: otherUser.profile_img }}
                      style={styles.messageAvatar}
                    />
                  )}
                  <ThemeText style={[
                    styles.messageText,
                    isCurrentUser ? styles.sentText : styles.receivedText
                  ]}>
                    {message.text}
                  </ThemeText>
                </ThemedView>
              );
            }}
          />
        </ScrollView>

        <ThemedView style={[styles.inputContainer,{borderColor:dark ? '#212121' : '#eaeaea'}]} darkColor='#212121'>
          <TextInput
            style={[styles.input,{backgroundColor:dark ? 'black' : '#eaeaea',color:dark ? 'white' : 'black'}]}
            placeholder="Type a message"
            value={newMessage}
            placeholderTextColor={dark ? 'white' : 'black'}
            onChangeText={setNewMessage}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !newMessage.trim() && styles.sendButtonDisabled,
              {
                backgroundColor : dark ? 'black' :'#FF3B30'
              }
            ]}
            onPress={handleSendMessage}
            disabled={!newMessage.trim()}
          >
            <Feather name='send' size={20} color="#fff" />
          </TouchableOpacity>
        </ThemedView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 40 : StatusBar.currentHeight,
    paddingBottom: 8,
    // backgroundColor: '#fff',
  },
  time: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusIcons: {
    flexDirection: 'row',
    gap: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    // backgroundColor: '#fff',
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  onlineStatus: {
    fontSize: 12,
    color: '#4CD964',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    // backgroundColor: '#f5f5f5',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCard: {
    margin: 16,
    padding: 20,
    backgroundColor: '#ff5e62',
    borderRadius: 16,
    alignItems: 'center',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#fff',
    marginBottom: 12,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  profileStats: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 16,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statIcon: {
    fontSize: 16,
  },
  statValue: {
    fontSize: 14,
    color: '#fff',
  },
  viewProfileButton: {
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  viewProfileText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messageBubble: {
    maxWidth: '70%',
    padding: 12,
    borderRadius: 18,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  sentBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#FF3B30',
    borderBottomRightRadius: 4,
  },
  receivedBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E5EA',
    borderBottomLeftRadius: 4,
  },
  messageAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    maxWidth: '70%',
  },
  sentText: {
    color: '#fff',
  },
  receivedText: {
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    // backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eaeaea',
  },
  input: {
    flex: 1,
    borderRadius: 24,
    backgroundColor: '#f2f2f2',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    marginRight: 12,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
});
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Button, FlatList, TouchableOpacity } from 'react-native';
import { HeaderButtons, Item } from 'react-navigation-header-buttons';
import { useSelector } from 'react-redux';
import CustomHeaderButton from '../components/CustomHeaderButton';
import DataItem from '../components/DataItem';
import PageContainer from '../components/PageContainer';
import PageTitle from '../components/PageTitle';
import colors from '../constants/colors';
import { Feather } from '@expo/vector-icons';
import { Header } from 'react-native/Libraries/NewAppScreen';

const ChatListScreen = props => {

    const selectedUser = props.route?.params?.selectedUserId;
    const selectedUserList = props.route?.params?.selectedUsers;
    const chatName = props.route?.params?.chatName;

    const userData = useSelector(state => state.auth.userData);
    const storedUsers = useSelector(state => state.users.storedUsers);
    const userChats = useSelector(state => {
        const chatsData = state.chats.chatsData;
        return Object.values(chatsData).sort((a, b) => {
            return new Date(b.updatedAt) - new Date(a.updatedAt);
        });
    });

    useEffect(() => {
        props.navigation.setOptions({

            headerRight: () => {
                return <HeaderButtons
                    HeaderButtonComponent={CustomHeaderButton}

                >
                    <Item
                        title="New chat"
                        iconName="create"
                        onPress={() => props.navigation.navigate("NewChat")}
                    />


                    <Item
                        title="New chat"
                        iconName="people"
                        onPress={() => props.navigation.navigate("NewChat", { isGroupChat: true })

                        }
                    />

                </HeaderButtons>
            }

        }
        )
    }, []);

    useEffect(() => {

        if (!selectedUser && !selectedUserList) {
            return;
        }

        let chatData;
        let navigationProps;

        if (selectedUser) {
            chatData = userChats.find(cd => !cd.isGroupChat && cd.users.includes(selectedUser))
        }

        if (chatData) {
            navigationProps = { chatId: chatData.key }
        }
        else {
            const chatUsers = selectedUserList || [selectedUser];
            if (!chatUsers.includes(userData.userId)) {
                chatUsers.push(userData.userId);
            }

            navigationProps = {
                newChatData: {
                    users: chatUsers,
                    isGroupChat: selectedUserList !== undefined,
                }
            }
            if (chatName) {
                navigationProps.newChatData.chatName = chatName;
            }
            else {
                navigationProps.newChatData.chatName = "";
            }
        }

        props.navigation.navigate("ChatScreen", navigationProps);

    }, [props.route?.params])

    return <PageContainer style={styles.container}>

        <PageTitle />
        <FlatList

            showsVerticalScrollIndicator={false}
            data={userChats}
            renderItem={(itemData) => {
                const chatData = itemData.item;
                const chatId = chatData.key;
                const isGroupChat = chatData.isGroupChat;

                let title = "";
                const subTitle = chatData.latestMessageText || "New chat";
                let image = "";

                if (isGroupChat) {
                    title = chatData.chatName;
                    image = chatData.chatImage;
                }
                else {
                    const otherUserId = chatData.users.find(uid => uid !== userData.userId);
                    const otherUser = storedUsers[otherUserId];

                    if (!otherUser) return;

                    title = `${otherUser.firstName} ${otherUser.lastName}`;
                    image = otherUser.profilePicture;
                }

                return <DataItem
                    title={title}
                    subTitle={subTitle}
                    image={image}
                    onPress={() => props.navigation.navigate("ChatScreen", { chatId })}
                    animationType="fade"

                />
            }}
        />
    </PageContainer>
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft:0.5
    },
    newGroupText: {
        color: colors.blue,
        fontSize: 17,
        marginBottom: 5
    }
})

export default ChatListScreen;
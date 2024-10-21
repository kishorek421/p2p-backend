import { View, Text, Image, FlatList, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { HStack } from '@/components/ui/hstack'
import { Card } from '@/components/ui/card';
import { Button, ButtonText } from '@/components/ui/button';
import api from '@/services/api';
import { router } from 'expo-router';

const UsersList = () => {
  return (
    <View>
      <Text>UsersList</Text>
    </View>
  )
}

export default UsersList
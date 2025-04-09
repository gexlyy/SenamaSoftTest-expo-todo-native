import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { InputItem, Button, List, Checkbox, Toast } from '@ant-design/react-native';
import Icon from '@ant-design/react-native/lib/icon';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

const API_URL = 'http://localhost:5000/api/todos';

const TodoApp = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchTodos = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Failed to fetch todos');
      const data = await response.json();
      setTodos(data);
    } catch (error) {
      Toast.fail('Error loading todos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const handleCreate = async () => {
    if (!inputValue.trim()) return;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputValue }),
      });

      if (!response.ok) throw new Error('Failed to create todo');

      setInputValue('');
      await fetchTodos();
      Toast.success('Todo added successfully');
    } catch (error) {
      Toast.fail('Error creating todo');
      console.error(error);
    }
  };

  const handleToggle = async (id: string, completed: boolean) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed }),
      });

      if (!response.ok) throw new Error('Failed to update todo');

      await fetchTodos();
    } catch (error) {
      Toast.fail('Error updating todo');
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete todo');

      await fetchTodos();
      Toast.success('Todo deleted successfully');
    } catch (error) {
      Toast.fail('Error deleting todo');
      console.error(error);
    }
  };

  const startEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const saveEdit = async () => {
    if (!editingId || !editText.trim()) return;

    try {
      const response = await fetch(`${API_URL}/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: editText }),
      });

      if (!response.ok) throw new Error('Failed to update todo');

      setEditingId(null);
      await fetchTodos();
      Toast.success('Todo updated successfully');
    } catch (error) {
      Toast.fail('Error updating todo');
      console.error(error);
    }
  };

  return (
    <View style={{ padding: 16, flex: 1 }}>
      <Text style={{ fontSize: 24, textAlign: 'center', marginBottom: 20 }}>Todo App</Text>

      <View style={{ flexDirection: 'row', marginBottom: 20 }}>
        <InputItem
          value={inputValue}
          onChange={(value) => setInputValue(value)}
          placeholder="Add a new todo"
          style={{ flex: 1 }}
        />
        <Button 
          type="primary" 
          onPress={handleCreate} 
          style={{ 
            marginLeft: 8, 
            backgroundColor: "white", 
            borderColor: '#DE3163'
          }}
        >
          <Text style={{ color: '#DE3163' }}>Add</Text>
        </Button>
      </View>

      <ScrollView>
        <List>
          {todos.map((todo) => (
            <List.Item
              key={todo.id}
              extra={
                <View style={{ flexDirection: 'row' }}>
                  <Checkbox
                    checked={todo.completed}
                    onChange={() => handleToggle(todo.id, todo.completed)}
                  />
                  <Button
                    style={{ marginLeft: 8 }}
                    onPress={() => startEdit(todo)}
                  >
                    <Icon name="delete" />
                  </Button>
                  <Button
                    type="warning"
                    style={{ marginLeft: 8 }}
                    onPress={() => handleDelete(todo.id)}
                  >
                    <Icon name="delete" />
                  </Button>
                </View>
              }
            >
              {editingId === todo.id ? (
                <InputItem
                  value={editText}
                  onChange={(value) => setEditText(value)}
                  onBlur={saveEdit}
                  autoFocus
                />
              ) : (
                <Text
                  style={{
                    textDecorationLine: todo.completed ? 'line-through' : 'none',
                    opacity: todo.completed ? 0.6 : 1,
                  }}
                >
                  {todo.text}
                </Text>
              )}
            </List.Item>
          ))}
        </List>
      </ScrollView>
    </View>
  );
};

export default TodoApp;
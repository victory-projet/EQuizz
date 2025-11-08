import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import type { Classe } from '../../domain/entities/Classe.entity';

interface ClassePickerProps {
  classes: Classe[];
  selectedClasseId: string;
  onSelectClasse: (classeId: string) => void;
  placeholder?: string;
}

export const ClassePicker: React.FC<ClassePickerProps> = ({
  classes,
  selectedClasseId,
  onSelectClasse,
  placeholder = 'Sélectionnez votre classe',
}) => {
  const [modalVisible, setModalVisible] = React.useState(false);

  const selectedClasse = classes.find((c) => c.id === selectedClasseId);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.pickerButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.pickerText, !selectedClasse && styles.placeholderText]}>
          {selectedClasse ? selectedClasse.nom : placeholder}
        </Text>
        <MaterialIcons name="arrow-drop-down" size={24} color="#666" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sélectionnez votre classe</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={classes}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.classItem,
                    item.id === selectedClasseId && styles.selectedItem,
                  ]}
                  onPress={() => {
                    onSelectClasse(item.id);
                    setModalVisible(false);
                  }}
                >
                  <View style={styles.classInfo}>
                    <Text style={styles.className}>{item.nom}</Text>
                    {item.Ecole && (
                      <Text style={styles.classDetail}>{item.Ecole.nom}</Text>
                    )}
                  </View>
                  {item.id === selectedClasseId && (
                    <MaterialIcons name="check" size={24} color="#3A5689" />
                  )}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    borderRadius: 10,
    borderWidth: 1.2,
    borderColor: '#E0E0E0',
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  pickerText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  placeholderText: {
    color: '#A1A1A1',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  classItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  selectedItem: {
    backgroundColor: '#F0F4FF',
  },
  classInfo: {
    flex: 1,
  },
  className: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  classDetail: {
    fontSize: 14,
    color: '#666',
  },
  separator: {
    height: 1,
    backgroundColor: '#F0F0F0',
  },
});

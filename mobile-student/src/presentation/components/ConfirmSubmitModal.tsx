import React from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';

type ConfirmSubmitModalProps = {
    visible: boolean;
    unansweredCount: number;
    onCancel: () => void;
    onConfirm: () => void;
};

export const ConfirmSubmitModal = ({
    visible,
    unansweredCount,
    onCancel,
    onConfirm,
}: ConfirmSubmitModalProps) => {
    return (
        <Modal
        transparent
        animationType="fade"
        visible={visible}
        onRequestClose={onCancel}
        >
            <View style={modalStyles.overlay}>
                <View style={modalStyles.container}>
                    <Text style={modalStyles.title}>Confirmer la soumission</Text>

                    <Text style={modalStyles.message}>
                        {unansweredCount > 0
                        ? `Il reste ${unansweredCount} question(s) sans réponse.\nSouhaitez-vous continuer ?`
                        : `Êtes-vous sûr de vouloir soumettre vos réponses ?\nCette action est irréversible.`}
                    </Text>

                    <View style={modalStyles.actions}>
                        <TouchableOpacity
                        style={[modalStyles.button, modalStyles.cancel]}
                        onPress={onCancel}
                        >
                        <Text style={modalStyles.cancelText}>Annuler</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                        style={[modalStyles.button, modalStyles.confirm]}
                        onPress={onConfirm}
                        >
                        <Text style={modalStyles.confirmText}>Soumettre</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const modalStyles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: '85%',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        fontSize: 15,
        color: '#374151',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancel: {
        backgroundColor: '#E5E7EB',
    },
    confirm: {
        backgroundColor: '#3A5689',
    },
    cancelText: {
        color: '#374151',
        fontWeight: '600',
        fontSize: 16,
    },
    confirmText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 16,
    },
});

package com.pfemanager.services;

import com.pfemanager.entities.User;
import com.pfemanager.repositories.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> getAll() {
        return userRepository.findAll();
    }

    public Optional<User> getById(Long id) {
        return userRepository.findById(id);
    }

    public User save(User user) {
        return userRepository.save(user);
    }

    public User update(Long id, User updatedUser) {
        return userRepository.findById(id).map(user -> {
            user.setNom(updatedUser.getNom());
            user.setPrenom(updatedUser.getPrenom());
            user.setTel(updatedUser.getTel());
            user.setEmail(updatedUser.getEmail());
            return userRepository.save(user);
        }).orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec l'id : " + id));
    }

    public void delete(Long id) {
        userRepository.deleteById(id);
    }
}
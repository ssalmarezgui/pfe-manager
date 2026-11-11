package com.pfemanager.repositories;

import com.pfemanager.entities.ERole;
import com.pfemanager.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Boolean existsByEmail(String email);

    // Ajout explicite de @Param("role")
    @Query("SELECT COUNT(u) FROM User u JOIN u.roles r WHERE r.libelle = :role")
    long countByRole(@Param("role") ERole role);
}
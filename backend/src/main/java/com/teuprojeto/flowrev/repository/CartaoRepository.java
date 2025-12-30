package com.teuprojeto.flowrev.repository;

import com.teuprojeto.flowrev.model.Cartao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CartaoRepository extends JpaRepository<Cartao, Long> {
    // Aqui podes adicionar buscas personalizadas se precisares
    // Ex: List<Cartao> findByColuna(String coluna);
}

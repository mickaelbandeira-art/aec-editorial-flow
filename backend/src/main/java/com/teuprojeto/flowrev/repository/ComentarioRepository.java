package com.teuprojeto.flowrev.repository;

import com.teuprojeto.flowrev.model.Comentario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ComentarioRepository extends JpaRepository<Comentario, Long> {
    List<Comentario> findByCartaoId(Long cartaoId);
}

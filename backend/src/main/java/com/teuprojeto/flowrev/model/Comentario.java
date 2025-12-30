package com.teuprojeto.flowrev.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "comentarios")
public class Comentario {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String texto;
    
    private String autor; // Ex: "Mickael"
    private LocalDateTime dataHora;

    @ManyToOne
    @JsonIgnore // Para não criar loop infinito
    @JoinColumn(name = "cartao_id")
    private Cartao cartao;

    // Construtor Vazio
    public Comentario() {}
    
    public Comentario(String texto, String autor, Cartao cartao) {
        this.texto = texto;
        this.autor = autor;
        this.cartao = cartao;
        this.dataHora = LocalDateTime.now();
    }
    
    // --- Getters e Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTexto() { return texto; }
    public void setTexto(String texto) { this.texto = texto; }

    public String getAutor() { return autor; }
    public void setAutor(String autor) { this.autor = autor; }

    public LocalDateTime getDataHora() { return dataHora; }
    public void setDataHora(LocalDateTime dataHora) { this.dataHora = dataHora; }

    public Cartao getCartao() { return cartao; }
    public void setCartao(Cartao cartao) { this.cartao = cartao; }
}

package com.teuprojeto.flowrev.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "cartoes")
public class Cartao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titulo;

    @Column(length = 5000) // Permite textos longos (HTML do editor)
    private String descricao;

    private String coluna; // Ex: "nao-iniciado", "feito"

    private LocalDate dataEntrega;

    private String responsavel; // Ex: "mickael"

    // Construtor vazio (obrigatório para JPA)
    public Cartao() {}

    // Construtor para criação rápida
    public Cartao(String titulo, String coluna) {
        this.titulo = titulo;
        this.coluna = coluna;
    }

    // --- Getters e Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public String getColuna() { return coluna; }
    public void setColuna(String coluna) { this.coluna = coluna; }
    public LocalDate getDataEntrega() { return dataEntrega; }
    public void setDataEntrega(LocalDate dataEntrega) { this.dataEntrega = dataEntrega; }
    public String getResponsavel() { return responsavel; }
    public void setResponsavel(String responsavel) { this.responsavel = responsavel; }
}

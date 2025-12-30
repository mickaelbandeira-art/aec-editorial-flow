package com.teuprojeto.flowrev.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "anexos")
public class Anexo {
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String nomeArquivo;
    private String caminhoNoDisco; // Onde o arquivo está guardado
    private String urlPublica; // URL para download

    @ManyToOne
    @JoinColumn(name = "cartao_id")
    @JsonIgnore // Evita loop infinito no JSON
    private Cartao cartao;

    public Anexo() {}

    public Anexo(String nomeArquivo, String caminhoNoDisco, String urlPublica, Cartao cartao) {
        this.nomeArquivo = nomeArquivo;
        this.caminhoNoDisco = caminhoNoDisco;
        this.urlPublica = urlPublica;
        this.cartao = cartao;
    }

    // --- Getters e Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNomeArquivo() { return nomeArquivo; }
    public void setNomeArquivo(String nomeArquivo) { this.nomeArquivo = nomeArquivo; }

    public String getCaminhoNoDisco() { return caminhoNoDisco; }
    public void setCaminhoNoDisco(String caminhoNoDisco) { this.caminhoNoDisco = caminhoNoDisco; }

    public String getUrlPublica() { return urlPublica; }
    public void setUrlPublica(String urlPublica) { this.urlPublica = urlPublica; }

    public Cartao getCartao() { return cartao; }
    public void setCartao(Cartao cartao) { this.cartao = cartao; }
}

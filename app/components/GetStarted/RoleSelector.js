'use client'
import React from 'react'
import Link from 'next/link'
import './GetStarted.css'

const RoleSelector = () => {
    return (
        <div className="container">
            {/* Animated Background */}
            <div className="background">
                <div className="backgroundShape1"></div>
                <div className="backgroundShape2"></div>
                <div className="backgroundShape3"></div>
            </div>

            <div className="content">
                <div className="selectionContainer">
                    <div className="headerSection">
                        <h1 className="mainTitle">
                            Comienza con <span className="brandText">Diversia Eternals</span>
                        </h1>
                        <p className="subtitle">
                            Elige tu camino para desbloquear superpoderes neurodivergentes
                        </p>
                    </div>

                    <div className="optionsGrid">
                        <Link href="/register/candidate" className="optionCardWrapper">
                            <div className="optionCard">
                                <div className="optionIcon">👤</div>
                                <h3 className="optionTitle">Soy un Candidato</h3>
                                <p className="optionDescription">
                                    Descubre tus fortalezas únicas y encuentra roles que coincidan con tus superpoderes
                                </p>
                                <div className="optionFeatures">
                                    <span>✨ Evaluación de Superpoderes</span>
                                    <span>🎯 Emparejamiento Personalizado</span>
                                    <span>📈 Desarrollo Profesional</span>
                                </div>
                                <button className="optionButton">Comienza tu Viaje</button>
                            </div>
                        </Link>

                        <Link href="/register/company" className="optionCardWrapper">
                            <div className="optionCard">
                                <div className="optionIcon">🏢</div>
                                <h3 className="optionTitle">Soy una Empresa</h3>
                                <p className="optionDescription">
                                    Encuentra talento neurodivergente excepcional y aprende a construir equipos inclusivos
                                </p>
                                <div className="optionFeatures">
                                    <span>🔍 Acceso a Talento Premium</span>
                                    <span>🎓 Recursos de Capacitación</span>
                                    <span>📊 Análisis de Diversidad</span>
                                </div>
                                <button className="optionButton">Buscar Talento</button>
                            </div>
                        </Link>

                        <Link href="/register/therapist" className="optionCardWrapper">
                            <div className="optionCard">
                                <div className="optionIcon">🩺</div>
                                <h3 className="optionTitle">Soy un Terapeuta</h3>
                                <p className="optionDescription">
                                    Apoya a individuos neurodivergentes y ayúdales a prosperar en su camino profesional
                                </p>
                                <div className="optionFeatures">
                                    <span>👥 Gestión de Clientes</span>
                                    <span>📋 Herramientas de Evaluación</span>
                                    <span>💼 Recursos Profesionales</span>
                                </div>
                                <button className="optionButton">Comenzar a Ayudar</button>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RoleSelector

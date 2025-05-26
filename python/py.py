print("te amo preciosa, eres eñ amor de mi vida")
import gurobipy as gp
from gurobipy import GRB
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

# Crear DataFrame con los datos proporcionados
data = pd.read_excel("TC 2025-1 datos_4624266.xlsx")

data = pd.DataFrame(data)

clientes = data['ID'].tolist()
coords = list(zip(data['X'], data['Y']))
demanda = dict(zip(data['ID'], data['Demanda']))

nodos = list(range(len(clientes)))
N = len(nodos)  # Debe ser 26 (depósito + 25 clientes)
K = 4  # número de vehículos
Q = 2000  # capacidad

# Verificación
print(f"Número total de nodos (depósito + clientes): {N}")
print(f"Número de clientes: {N-1}")

# Matriz de distancias
dist = np.zeros((N, N))
for i in range(N):
    for j in range(N):
        if i != j:
            dist[i][j] = np.hypot(coords[i][0] - coords[j][0], coords[i][1] - coords[j][1])

# --------------------------- MODELO BALANCEADO POR DISTANCIA ---------------------------
print("\n=== MODELO BALANCEADO POR DISTANCIA ===")
m_dist = gp.Model("CVRP_balanceado_distancia")

# Configuración de parámetros básicos de Gurobi
m_dist.setParam('TimeLimit', 600)  # 5 minutos como máximo
m_dist.setParam('MIPGap', 0.03)    # Aceptar soluciones dentro del 5% del óptimo

# Variables
x = m_dist.addVars(N, N, K, vtype=GRB.BINARY, name="x")  # camión k viaja de i a j
u = m_dist.addVars(N, K, vtype=GRB.CONTINUOUS, lb=0, ub=Q, name="u")  # carga acumulada
dist_ruta = m_dist.addVars(K, vtype=GRB.CONTINUOUS, name="dist_ruta")  # distancia total de cada ruta
max_distancia = m_dist.addVar(vtype=GRB.CONTINUOUS, name="max_distancia")  # para balanceo por distancia

# Objetivo: minimizar la máxima distancia por camión
m_dist.setObjective(max_distancia, GRB.MINIMIZE)

# Cada cliente debe ser visitado exactamente una vez
for j in nodos[1:]:
    m_dist.addConstr(gp.quicksum(x[i, j, k] for i in nodos if i != j for k in range(K)) == 1)

# Flujo por camión
for k in range(K):
    for h in nodos:
        m_dist.addConstr(
            gp.quicksum(x[i, h, k] for i in nodos if i != h) ==
            gp.quicksum(x[h, j, k] for j in nodos if j != h)
        )

# Un solo viaje de ida y vuelta al depósito por camión
for k in range(K):
    m_dist.addConstr(gp.quicksum(x[0, j, k] for j in nodos if j != 0) <= 1)
    m_dist.addConstr(gp.quicksum(x[i, 0, k] for i in nodos if i != 0) <= 1)

# Eliminación de subtours (MTZ extendido)
for k in range(K):
    for i in nodos[1:]:
        m_dist.addConstr(u[i, k] >= demanda[i])
        m_dist.addConstr(u[i, k] <= Q)
    for i in nodos[1:]:
        for j in nodos[1:]:
            if i != j:
                m_dist.addConstr(u[i, k] - u[j, k] + Q * x[i, j, k] <= Q - demanda[j])

# Calcular la distancia total por ruta
for k in range(K):
    m_dist.addConstr(dist_ruta[k] == gp.quicksum(dist[i, j] * x[i, j, k] for i in nodos for j in nodos if i != j))
    m_dist.addConstr(dist_ruta[k] <= max_distancia)  # Restricción para el balanceo

# Asegurar uso de todos los vehículos para un mejor balanceo
for k in range(K):
    m_dist.addConstr(gp.quicksum(x[0, j, k] for j in nodos[1:]) >= 1)

# Resolver
print("Iniciando optimización... (máximo 5 minutos, gap aceptable: 5%)")
m_dist.optimize()

# Procesar solución
if m_dist.status == GRB.OPTIMAL or m_dist.status == GRB.TIME_LIMIT:
    if m_dist.status == GRB.TIME_LIMIT and m_dist.SolCount == 0:
        print("⚠️ Se alcanzó el límite de tiempo sin encontrar una solución factible.")
    else:
        # Si llegamos al límite de tiempo pero tenemos al menos una solución factible
        gap = m_dist.MIPGap * 100 if m_dist.SolCount > 0 else float('inf')
        status_str = "óptima" if m_dist.status == GRB.OPTIMAL else f"factible (gap: {gap:.2f}%)"
        print(f"Solución {status_str} encontrada.")
        print(f"Objetivo (máxima distancia por ruta): {max_distancia.X:.2f} unidades")
        
        # Extraer rutas
        rutas_por_camion = []
        distancias_por_camion = []
        clientes_por_camion = []
        
        # Colores para los gráficos
        colores = ['purple', 'cyan', 'gold', 'deeppink']
        
        # Crear una única figura grande para todos los camiones
        plt.figure(figsize=(15, 15))
        
        for k in range(K):
            rutas = []
            for i in nodos:
                for j in nodos:
                    if i != j and x[i, j, k].X > 0.5:
                        rutas.append((i, j))
            
            if rutas:
                usados = set()
                ruta = []
                actual = 0  # Comenzar en el depósito
                ruta.append(actual)
                
                while True:
                    siguiente = None
                    for (i, j) in rutas:
                        if i == actual and (i, j) not in usados:
                            siguiente = j
                            usados.add((i, j))
                            ruta.append(j)
                            actual = j
                            break
                    if siguiente is None:
                        # Si no hay siguiente, volver al depósito si no estamos ya ahí
                        if actual != 0:
                            for (i, j) in rutas:
                                if i == actual and j == 0 and (i, j) not in usados:
                                    ruta.append(0)
                                    break
                        break
                
                # Solo consideramos rutas que salen del depósito, visitan algún cliente y vuelven
                if len(ruta) > 2:
                    # Si la ruta no termina en el depósito, verificar si hay un arco de vuelta
                    if ruta[-1] != 0:
                        # Buscar un arco de vuelta al depósito
                        for (i, j) in rutas:
                            if i == ruta[-1] and j == 0 and (i, j) not in usados:
                                ruta.append(0)
                                break
                    
                    rutas_por_camion.append(ruta)
                    
                    # Contar clientes (excluyendo el depósito)
                    clientes_visitados = len([n for n in ruta if n != 0])
                    clientes_por_camion.append(clientes_visitados)
                    
                    # Calcular distancia
                    distancia = 0
                    for idx in range(len(ruta) - 1):
                        desde = ruta[idx]
                        hasta = ruta[idx + 1]
                        distancia += dist[desde][hasta]
                    distancias_por_camion.append(distancia)
                    
                    # Graficar la ruta en la figura grande
                    color = colores[k % len(colores)]
                    
                    # Añadir a la figura grande
                    for idx in range(len(ruta) - 1):
                        x1, y1 = coords[ruta[idx]]
                        x2, y2 = coords[ruta[idx + 1]]
                        plt.arrow(x1, y1, x2 - x1, y2 - y1,
                                 length_includes_head=True,
                                 head_width=1.5, head_length=2.5,
                                 alpha=0.7, color=color, linewidth=1.5)
        
        # Añadir todos los nodos a la figura grande
        for i, (x_, y_) in enumerate(coords):
            if i == 0:
                plt.plot(x_, y_, 'ro', markersize=12)  # Depósito más grande y rojo
                plt.text(x_ + 1, y_ + 1, "Depósito", fontsize=10)
            else:
                plt.plot(x_, y_, 'bo', markersize=8)
                plt.text(x_ + 1, y_ + 1, str(i), fontsize=8)
        
        plt.title(f"Rutas Balanceadas por Distancia (Gap: {gap:.2f}%)", fontsize=16)
        plt.grid(True)
        x_coords = [x for (x, y) in coords]
        y_coords = [y for (x, y) in coords]
        plt.xlim(min(x_coords) - 10, max(x_coords) + 10)
        plt.ylim(min(y_coords) - 10, max(y_coords) + 10)
        plt.savefig("rutas_balanceadas_distancia_todos_camiones.png", dpi=300, bbox_inches='tight')
        plt.close()
        
        # Gráficos individuales para cada camión
        for k in range(len(rutas_por_camion)):
            plt.figure(figsize=(10, 10))
            ruta = rutas_por_camion[k]
            color = colores[k % len(colores)]
            
            # Dibujar todos los nodos
            for i, (x_, y_) in enumerate(coords):
                if i == 0:
                    plt.plot(x_, y_, 'ro', markersize=12)  # Depósito más grande y rojo
                    plt.text(x_ + 1, y_ + 1, "Depósito", fontsize=10)
                else:
                    plt.plot(x_, y_, 'bo', markersize=8)
                    plt.text(x_ + 1, y_ + 1, str(i), fontsize=8)
            
            # Dibujar la ruta específica
            for i in range(len(ruta) - 1):
                x1, y1 = coords[ruta[i]]
                x2, y2 = coords[ruta[i + 1]]
                plt.arrow(x1, y1, x2 - x1, y2 - y1,
                         length_includes_head=True,
                         head_width=1.5, head_length=2.5,
                         alpha=0.7, color=color, linewidth=2)
            
            plt.title(f"Camión {k+1}: {clientes_por_camion[k]} clientes, {distancias_por_camion[k]:.2f} unidades", fontsize=14)
            plt.grid(True)
            plt.xlim(min(x_coords) - 10, max(x_coords) + 10)
            plt.ylim(min(y_coords) - 10, max(y_coords) + 10)
            plt.savefig(f"ruta_balanceada_distancia_camion_{k+1}.png", dpi=300, bbox_inches='tight')
            plt.close()
        
        # Métricas
        print("\nRecorridos de los camiones (balanceo por distancia):")
        total_clientes = 0
        for idx, ruta in enumerate(rutas_por_camion):
            n_clientes = clientes_por_camion[idx]
            total_clientes += n_clientes
            print(f"Camión {idx + 1}: {' → '.join(map(str, ruta))}")
            print(f"  Distancia: {distancias_por_camion[idx]:.2f} unidades")
            print(f"  Clientes atendidos: {n_clientes}")

        print(f"\n✅ Total clientes atendidos: {total_clientes} (esperado: {N - 1})")
        print(f"🚛 Máxima distancia por ruta: {max_distancia.X:.2f} unidades")
        print(f"📏 Distancia total recorrida: {sum(distancias_por_camion):.2f} unidades")
        
        # Verificar clientes atendidos
        clientes_atendidos = set()
        for ruta in rutas_por_camion:
            for nodo in ruta:
                if nodo != 0:  # Si no es el depósito
                    clientes_atendidos.add(nodo)
        
        print(f"\nClientes atendidos: {sorted(list(clientes_atendidos))}")
        print(f"Total de clientes únicos atendidos: {len(clientes_atendidos)}")
        
        # Verificar clientes no atendidos
        todos_clientes = set(range(1, N))
        no_atendidos = todos_clientes - clientes_atendidos
        if no_atendidos:
            print(f"⚠️ Clientes no atendidos: {sorted(list(no_atendidos))}")
            
        # Análisis de balanceo
        print("\nAnálisis de balanceo de distancias:")
        print(f"Distancia mínima: {min(distancias_por_camion):.2f}")
        print(f"Distancia máxima: {max(distancias_por_camion):.2f}")
        print(f"Diferencia max-min: {max(distancias_por_camion) - min(distancias_por_camion):.2f}")
        print(f"Desviación estándar: {np.std(distancias_por_camion):.2f}")
        
else:
    print("⚠️ El modelo no tiene solución factible.")
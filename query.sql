CREATE TABLE Maisons(
    maisonID INT NOT NULL,
    nom varchar(255) NOT NULL,
    channelName varchar(255) NOT NULL,
    roleID varchar(255) NOT NULL,
    channelID varchar(255) NOT NULL
    CONSTRAINT pk_maison_maisonid PRIMARY KEY (maisonID)

);

CREATE TABLE Utilisateurs(
    userID varchar(255) NOT NULL,
    username varchar(255) NOT NULL,
    maisonID INT NOT NULL,
    arriveDate DATE NOT NULL,
    objectif TEXT
    CONSTRAINT pk_utilisateurs_userid PRIMARY KEY (userID),
    CONSTRAINT fk_utilisateurs_maisonid FOREIGN KEY (maisonID) REFERENCES Maisons (maisonID)
);

-- evenementType peut prendre 4 valeurs
-- 0 pour un entrainement
-- 1 pour une vidéo postée
-- 2 pour un message
-- 3 pour une vidéo challenge hebdomadaire

CREATE TABLE Evenements(
    evenementID INT AUTO_INCREMENT,
    evenementType INT,
    userID varchar(255),
    points INT,
    date DATE,

    PRIMARY KEY (evenementID)
);

INSERT INTO Evenements (evenementType, userID, points, date) VALUES (2, '322091091325091840', 1, '2023-03-07');

INSERT INTO Evenements (evenementType, userID, points, date) VALUES (0, '322091091325091840', 100, '2023-03-07');


                        INSERT INTO Utilisateurs (userID, username, maisonID, arriveDate) 
                        VALUES ('444992711934607366', 'Docteur W', 0, '2023-03-03');

-- Insertion des valeurs des trois maisons
INSERT INTO Maisons (maisonID, nom, channelName, channelID) VALUES (0, 'Les fils de Ragnar', 'fils-de-ragnar', '1021418031898951721');
INSERT INTO Maisons (maisonID, nom, channelName, channelID) VALUES (1, 'Les héritiers de Guillaume le conquérant', 'héritiers-de-guillaume-le-conquérant', '1021418112156975155');
INSERT INTO Maisons (maisonID, nom, channelName, channelID) VALUES (2, 'Les disciples d''Attila le Hun', 'disciples-dattila-le-hun', '1021418175293821040');


CREATE USER 'ZUser'@'%' IDENTIFIED BY 'ZPasswd#';
GRANT ALL PRIVILEGES ON *.* TO 'ZUser'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;


-- Message Point
WITH Exist AS(
    SELECT COUNT(userID) AS boolExist
    FROM Utilisateurs
    WHERE userID ='290226448160129035'
),
Messages AS (
    SELECT COUNT(evenementID) AS nbMessages
    FROM Evenements
    WHERE userID ='290226448160129035' AND evenementType = 2
)
SELECT boolExist, nbMessages
FROM Messages JOIN Exist;

-- Training Point
WITH Exist AS(
    SELECT COUNT(userID) AS boolExist, userID
    FROM Utilisateurs
    WHERE userID = '290226448160129035'
),
Training AS (
SELECT COUNT(evenementID) AS boolTraining
FROM Evenements
WHERE userID = '290226448160129035' AND evenementType = 0 AND date = '2023-03-03'
)
SELECT boolExist, boolTraining
FROM Training JOIN Exist;


-- MaisonScore

WITH classementTable AS (
  SELECT maisonID, username, SUM(points) AS points,
         ROW_NUMBER() OVER (PARTITION BY maisonID ORDER BY SUM(points) DESC) AS position
  FROM Evenements JOIN Utilisateurs USING(userID)
  GROUP BY maisonID, username
),
entrainementTable AS (
    SELECT U.maisonID, COUNT(E.evenementID) AS nbENtrainements
    FROM Utilisateurs U JOIN Evenements E USING (userID)
    WHERE E.evenementType = 0
    GROUP BY U.maisonID
),
pointsTable AS (
    SELECT U.maisonID, SUM(E.points) AS pointsMaison
    FROM Utilisateurs U JOIN Evenements E USING (userID)
    GROUP BY U.maisonID
)
SELECT M.maisonID, M.nom, C.username, E.nbENtrainements, P.pointsMaison
FROM classementTable C JOIN entrainementTable E USING (maisonID)
                       JOIN pointsTable P USING (maisonID)
                       JOIN Maisons M USING (maisonID)
WHERE C.position = 1
ORDER BY P.pointsMaison DESC;

/*Maisons (maisonID, nomMaison, channelName, roleID, channelID)
    (m,n,cn,r,ci) ∈ Maisons ⇐⇒ La maison de nom n identifiée par le numéro m,
    dont le channel Discord est cn d'ID ci et dont le rôle associé est r.
*/
/*Utilisateurs (userID, username, maisonID, arriveDate, themeObjectif, detailObjectif)
    (ui, un, m, ad, o) ∈ Utilisateurs ⇐⇒ L'utilisateur de nom un identifié par ui
    arrivé le ad en intégrant la maison m et qui a pour objectif o. 
*/
/*Evenements (evenementID, evenementType, userID, evenementPoints, evenementDate)
    (ei, et, ui, p, d) ∈ Evenements ⇐⇒ L'évènement identifié par ei du type et
    réalisé par l'utilisateur ui le d rapportant p points*/
-- evenementType peut prendre 4 valeurs
-- 0 pour un entrainement
-- 1 pour une vidéo postée
-- 2 pour un message
-- 3 pour un challenge hebdomadaire
-- 4 pour une pénalité

Contraintes d'intégrité référentielles : 
Maisons[maisonID] ⊆ Utilisateurs[maisonID]
Utilisateurs ⊆ Evenements[userID]

Domaines : 
domaine(arriveDate) = domaine(evenementDate) = date

domaine(nom) = domaine(channelName) = domaine(username) = domaine(themeObjectif)
= domaine(detailObjectif) = chaîne de caractères

domaine(roleID) = domaine(channelID) = domaine(userID) = varchar(25)

domaine(maisonID) = domaine(evenementID) = domaine(evenementType) = domaine(evenementPoints) = Integer

CREATE TABLE Maisons(
    maisonID INT NOT NULL,
    nomMaison varchar(255) NOT NULL,
    channelName varchar(255) NOT NULL,
    roleID varchar(25) NOT NULL,
    channelID varchar(25) NOT NULL,
    CONSTRAINT pk_maison_maisonid PRIMARY KEY (maisonID)
);

CREATE TABLE Utilisateurs(
    userID varchar(25) NOT NULL,
    username varchar(255) NOT NULL,
    maisonID INT NOT NULL,
    arriveDate DATE NOT NULL,
    themeObjectif TEXT,
    detailObjectif TEXT,
    CONSTRAINT pk_utilisateurs_userid PRIMARY KEY (userID),
    CONSTRAINT fk_utilisateurs_maisonid FOREIGN KEY (maisonID) REFERENCES Maisons (maisonID)
);
INSERT INTO Utilisateurs (userID, username, maisonID, arriveDate) VALUES ('0', 'Vikings', 0, '2023-04-25');
INSERT INTO Utilisateurs (userID, username, maisonID, arriveDate) VALUES ('1', 'Chevaliers', 1, '2023-04-25');
INSERT INTO Utilisateurs (userID, username, maisonID, arriveDate) VALUES ('2', 'Huns', 2, '2023-04-25');

CREATE TABLE Evenements(
    evenementID INT AUTO_INCREMENT NOT NULL,
    evenementType INT NOT NULL,
    userID varchar(25) NOT NULL,
    points INT NOT NULL,
    evenementDate DATE NOT NULL,
    CONSTRAINT pk_evenements_evenementid PRIMARY KEY (evenementID),
    CONSTRAINT fk_evenements_userid FOREIGN KEY (userID) REFERENCES Utilisateurs(userID),
    CONSTRAINT ck_evenements_evenementtype CHECK (evenementType IN (0,1,2,3,4))
);

-- Insertion des valeurs des trois maisons
INSERT INTO Maisons (maisonID, nomMaison, channelName, roleID, channelID) VALUES (0, 'Les fils de Ragnar', 'fils-de-ragnar', 1021809011277967370, 1021418031898951721);
INSERT INTO Maisons (maisonID, nomMaison, channelName, roleID, channelID) VALUES (1, 'Les héritiers de Guillaume le conquérant', 'héritiers-de-guillaume-le-conquérant', 1021809132707250176, 1021418112156975155);
INSERT INTO Maisons (maisonID, nomMaison, channelName, roleID, channelID) VALUES (2, 'Les disciples d''Attila le Hun', 'disciples-dattila-le-hun', 1021809267113725973, 1021418175293821040);

INSERT INTO Evenements (evenementType, userID, points, evenementDate) VALUES (0, '245277419865374723', 100, '2023-04-19');



-- Création d'un utilisateur pour l'application nodeJS
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
    SELECT COUNT(userID) AS boolExist, maisonID
    FROM Utilisateurs
    WHERE userID = '290226448160129035'
),
Training AS (
SELECT COUNT(evenementID) AS boolTraining
FROM Evenements
WHERE userID = '290226448160129035' AND evenementType = 0 AND evenementDate = '2023-03-03'
)
SELECT boolExist, roleID, channelID, boolTraining
FROM Training JOIN Exist
              JOIN Maisons USING (maisonID);


-- MaisonScore
-- checkMessage
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
SELECT M.maisonID, M.nomMaison, C.username, E.nbENtrainements, P.pointsMaison
FROM classementTable C JOIN entrainementTable E USING (maisonID)
                       JOIN pointsTable P USING (maisonID)
                       JOIN Maisons M USING (maisonID)
WHERE C.position = 1
ORDER BY P.pointsMaison DESC;
--channelName
WITH pointsParMaisons AS (
    SELECT maisonID, SUM(points) AS points
    FROM Evenements JOIN Utilisateurs USING (userID)
    GROUP BY maisonID
)
SELECT channelID, channelName
FROM Maisons JOIN pointsParMaisons USING (maisonID)
ORDER BY points DESC;

-- checkObj
SELECT COUNT(userID) AS Exist, COUNT(themeObjectif) AS ObjSet
FROM Utilisateurs
WHERE userID = ?;
-- updateObj
UPDATE Utilisateurs SET themeObjectif = ?, detailObjectif = ? WHERE userID = ?;

--VideoPoint
WITH Exist AS(
    SELECT COUNT(userID) AS boolExist, userID
    FROM Utilisateurs
    WHERE userID = ?
),
Training AS (
SELECT COUNT(evenementID) AS boolTraining
FROM Evenements
WHERE userID = ? AND evenementType = 1 AND evenementDate = ?
)
SELECT boolExist, boolTraining
FROM Training JOIN Exist;


-- list
SELECT username, SUM(points) AS points
FROM Utilisateurs JOIN Evenements USING (userID)
WHERE maisonID = 2
GROUP BY username
ORDER BY points DESC;





--stats
SELECT date, SUM(points)
FROM Evenements
WHERE userID = '290226448160129035'
GROUP BY date;


-- sp
SELECT SUM(E.points) AS pointsMaison
FROM Utilisateurs U JOIN Evenements E USING (userID)
WHERE U.userID = '0';

WITH pointsTable AS (
SELECT U.maisonID, SUM(E.points) AS pointsMaison
FROM Utilisateurs U JOIN Evenements E USING (userID)
GROUP BY U.maisonID
)
SELECT pointsMaison, username
FROM pointsTable JOIN Utilisateurs USING (maisonID)
WHERE userID = '0';

-- sp 2
INSERT INTO Evenements (evenementType, userID, points, evenementDate) VALUES (3, ?, ?, ?;

import csv
c = 0
with open('Data\DirectDepositFraud_Data.csv', 'r') as file:
    reader = csv.reader(file)
    for row in reader:
        print(row)
        c+=1
        if c>200:
            break
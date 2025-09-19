import csv
c = 0
with open('data2.csv', 'r') as file:
    reader = csv.reader(file)
    for row in reader:
        print(row)
        c+=1
        if c>2:
            break